// ╔══════════════════════════════════════════════════════════════╗
// ║  LoopGen  ·  Beta v0.2.0  (Production Hardening)           ║
// ║  Auth · Listings · Vintage · Chat · Saved · Profile         ║
// ╚══════════════════════════════════════════════════════════════╝
//
// SUPABASE SETUP (one-time):
//   1. Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env.local
//   2. Run loopgen-schema.sql in Supabase SQL Editor
//   3. Enable Email Auth: Supabase > Authentication > Providers > Email
//   4. Create storage bucket "listing-images" (public)
//   5. Enable Realtime on messages table:
//      Database > Replication > supabase_realtime > messages
//
// OPTIONAL:
//   6. Deploy supabase/functions/loopgen-ai-desc
//      supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { useState, useRef, useEffect, Component } from "react";
import { createClient } from "@supabase/supabase-js";
import LandingPage from "./LandingPage.jsx";

// ── ENV VARS ─────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const HAS_SUPABASE  = !!(SUPABASE_URL && SUPABASE_KEY);

// Supabase client (lazy — only if env vars are present)
const supabase = HAS_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── CONSTANTS ────────────────────────────────────────────────────
const GREEN = "#1c7c45";
const APP_VERSION = "2.3.0"; // bumped for beta deploy — realtime fix, password recovery, RLS hardening

// ── FIX 16: React Error Boundary — catches render crashes ────────
class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    // In production, send to error tracking (Sentry etc.)
    // Keep as console.error — this is an essential operational log
    console.error("[LoopGen] Render error:", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          minHeight:"100vh",padding:"32px 24px",background:"#f7f6f3",textAlign:"center",
        }}>
          <div style={{fontSize:48,marginBottom:16}}>😔</div>
          <div style={{fontSize:20,fontWeight:800,color:"#111",marginBottom:8}}>Something went wrong</div>
          <div style={{fontSize:14,color:"#6b7280",marginBottom:24,lineHeight:1.6}}>
            LoopGen hit an unexpected error. Your data is safe.
          </div>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{padding:"14px 28px",borderRadius:50,background:GREEN,border:"none",
              color:"white",fontWeight:700,fontSize:15,cursor:"pointer",
              fontFamily:"inherit",boxShadow:`0 6px 20px ${GREEN}44`}}>
            Reload App
          </button>
          <div style={{marginTop:16,fontSize:11,color:"#9ca3af"}}>
            If this keeps happening, contact{" "}
            <a href="mailto:support@loopgen.com.au" style={{color:GREEN,textDecoration:"none"}}>
              support@loopgen.com.au
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── AU POSTCODE → SUBURB LOOKUP ──────────────────────────────────
// Verified against postcodes-australia.com (authoritative AU Post data).
// Format: "postcode": "Primary Suburb, STATE"
const AU_POSTCODES = {
  // ── NSW ──
  "2000":"Sydney CBD, NSW","2010":"Surry Hills, NSW","2011":"Potts Point, NSW",
  "2015":"Alexandria, NSW","2016":"Redfern, NSW","2017":"Waterloo, NSW",
  "2018":"Eastlakes, NSW","2019":"Botany, NSW","2020":"Mascot, NSW",
  "2021":"Paddington, NSW","2022":"Randwick, NSW","2023":"Bellevue Hill, NSW",
  "2024":"Bronte, NSW","2025":"Woollahra, NSW","2026":"Bondi, NSW",
  "2027":"Darling Point, NSW","2028":"Double Bay, NSW","2029":"Rose Bay, NSW",
  "2030":"Vaucluse, NSW","2031":"Coogee, NSW","2032":"Kingsford, NSW",
  "2033":"Kensington, NSW","2034":"Maroubra, NSW","2035":"Pagewood, NSW",
  "2036":"Hillsdale, NSW","2037":"Glebe, NSW","2038":"Pyrmont, NSW",
  "2039":"Rozelle, NSW","2040":"Leichhardt, NSW","2041":"Balmain, NSW",
  "2042":"Newtown, NSW","2043":"Erskineville, NSW","2044":"St Peters, NSW",
  "2045":"Haberfield, NSW","2046":"Drummoyne, NSW","2047":"Rozelle, NSW",
  "2048":"Stanmore, NSW","2049":"Petersham, NSW","2050":"Camperdown, NSW",
  "2060":"North Sydney, NSW","2061":"Kirribilli, NSW","2062":"Cremorne, NSW",
  "2063":"Cremorne Point, NSW","2064":"Artarmon, NSW","2065":"St Leonards, NSW",
  "2066":"Lane Cove, NSW","2067":"Chatswood, NSW","2068":"Willoughby, NSW",
  "2069":"Roseville, NSW","2070":"Lindfield, NSW","2071":"Killara, NSW",
  "2072":"Gordon, NSW","2073":"Pymble, NSW","2074":"Turramurra, NSW",
  "2075":"St Ives, NSW","2076":"Wahroonga, NSW","2077":"Hornsby, NSW",
  "2079":"Mount Colah, NSW","2080":"Berowra, NSW","2081":"Berowra Heights, NSW",
  "2082":"Arcadia, NSW","2083":"Berowra Waters, NSW","2084":"Terrey Hills, NSW",
  "2085":"Manly, NSW","2086":"Dee Why, NSW","2087":"Frenchs Forest, NSW",
  "2088":"Mosman, NSW","2089":"Neutral Bay, NSW","2090":"Cremorne, NSW",
  "2092":"Seaforth, NSW","2093":"Curl Curl, NSW","2094":"Balgowlah, NSW",
  "2095":"Manly, NSW","2096":"Brookvale, NSW","2097":"Narrabeen, NSW",
  "2099":"Collaroy, NSW","2100":"Warriewood, NSW","2101":"Mona Vale, NSW",
  "2102":"Elanora Heights, NSW","2103":"Church Point, NSW","2104":"Avalon Beach, NSW",
  "2105":"Bayview, NSW","2106":"Newport, NSW","2107":"Avalon Beach, NSW",
  "2108":"Palm Beach, NSW","2109":"Hunters Hill, NSW","2110":"Drummoyne, NSW",
  "2111":"Ryde, NSW","2112":"Rhodes, NSW","2113":"Meadowbank, NSW",
  "2114":"Ermington, NSW","2115":"Dundas, NSW","2116":"Eastwood, NSW",
  "2117":"Epping, NSW","2118":"Carlingford, NSW","2119":"Beecroft, NSW",
  "2120":"Thornleigh, NSW","2121":"Pennant Hills, NSW","2122":"Marsfield, NSW",
  "2125":"West Pennant Hills, NSW","2126":"Cherrybrook, NSW","2127":"Newington, NSW",
  "2128":"Silverwater, NSW","2130":"Summer Hill, NSW","2131":"Ashfield, NSW",
  "2132":"Croydon, NSW","2133":"Burwood, NSW","2134":"Strathfield, NSW",
  "2135":"Homebush, NSW","2136":"Flemington, NSW","2137":"Concord, NSW",
  "2138":"Rhodes, NSW","2140":"Homebush West, NSW","2141":"Lidcombe, NSW",
  "2142":"Granville, NSW","2143":"Merrylands, NSW","2144":"Auburn, NSW",
  "2145":"Westmead, NSW","2146":"Toongabbie, NSW","2147":"Kings Langley, NSW",
  "2148":"Blacktown, NSW","2150":"Parramatta, NSW","2151":"North Parramatta, NSW",
  "2152":"Northmead, NSW","2153":"Baulkham Hills, NSW","2154":"Castle Hill, NSW",
  "2155":"Kellyville, NSW","2156":"Kenthurst, NSW","2157":"Annangrove, NSW",
  "2158":"Dural, NSW","2159":"Galston, NSW","2160":"Merrylands, NSW",
  "2161":"Granville, NSW","2162":"Villawood, NSW","2163":"Lansdowne, NSW",
  "2164":"Wetherill Park, NSW","2165":"Fairfield, NSW","2166":"Cabramatta, NSW",
  "2167":"Canley Vale, NSW","2168":"Bonnyrigg, NSW","2170":"Liverpool, NSW",
  "2171":"Casula, NSW","2172":"Moorebank, NSW","2173":"Hammondville, NSW",
  "2174":"Voyager Point, NSW","2175":"Greenfield Park, NSW","2176":"Smithfield, NSW",
  "2177":"Bossley Park, NSW","2178":"Abbotsbury, NSW","2179":"Busby, NSW",
  "2190":"Marrickville, NSW","2191":"Dulwich Hill, NSW","2192":"Ashbury, NSW",
  "2193":"Canterbury, NSW","2194":"Campsie, NSW","2195":"Lakemba, NSW",
  "2196":"Punchbowl, NSW","2197":"Yagoona, NSW","2198":"Bankstown, NSW",
  "2199":"Revesby, NSW","2200":"Bankstown, NSW","2203":"Dulwich Hill, NSW",
  "2204":"Marrickville, NSW","2205":"Arncliffe, NSW","2206":"Earlwood, NSW",
  "2207":"Bexley, NSW","2208":"Kingsgrove, NSW","2209":"Beverly Hills, NSW",
  "2210":"Lugarno, NSW","2211":"Padstow, NSW","2212":"Revesby, NSW",
  "2213":"Panania, NSW","2214":"Picnic Point, NSW","2216":"Rockdale, NSW",
  "2217":"Kogarah, NSW","2218":"Hurstville, NSW","2219":"Mortdale, NSW",
  "2220":"Hurstville, NSW","2221":"Blakehurst, NSW","2222":"Penshurst, NSW",
  "2223":"Mortdale, NSW","2224":"Sylvania, NSW","2225":"Sutherland, NSW",
  "2226":"Caringbah, NSW","2227":"Miranda, NSW","2228":"Kirrawee, NSW",
  "2229":"Gymea, NSW","2230":"Cronulla, NSW","2231":"Dolls Point, NSW",
  "2232":"Loftus, NSW","2233":"Engadine, NSW","2234":"Menai, NSW",
  "2250":"Gosford, NSW","2251":"Avoca Beach, NSW","2256":"Woy Woy, NSW",
  "2257":"Umina Beach, NSW","2260":"Wyong, NSW","2261":"The Entrance, NSW",
  "2263":"Gorokan, NSW","2264":"Morisset, NSW","2280":"Belmont, NSW",
  "2283":"Toronto, NSW","2284":"Warners Bay, NSW","2285":"Charlestown, NSW",
  "2286":"Glendale, NSW","2287":"Adamstown, NSW","2289":"Hamilton, NSW",
  "2290":"Broadmeadow, NSW","2291":"Wickham, NSW","2292":"Carrington, NSW",
  "2293":"Waratah, NSW","2295":"Merewether, NSW","2296":"Mayfield, NSW",
  "2300":"Newcastle, NSW","2302":"Newcastle West, NSW","2303":"Islington, NSW",
  "2304":"Georgetown, NSW","2305":"New Lambton, NSW","2307":"Garden Suburb, NSW",
  "2308":"Rankin Park, NSW","2315":"Nelson Bay, NSW","2316":"Salamander Bay, NSW",
  "2317":"Shoal Bay, NSW","2318":"Medowie, NSW","2319":"Williamtown, NSW",
  "2320":"Maitland, NSW","2322":"Rutherford, NSW","2323":"Thornton, NSW",
  "2325":"Cessnock, NSW","2326":"Kurri Kurri, NSW","2330":"Singleton, NSW",
  "2335":"Branxton, NSW","2340":"Tamworth, NSW","2350":"Armidale, NSW",
  "2360":"Inverell, NSW","2365":"Glen Innes, NSW","2370":"Tenterfield, NSW",
  "2380":"Narrabri, NSW","2390":"Moree, NSW","2420":"Dungog, NSW",
  "2430":"Taree, NSW","2440":"Port Macquarie, NSW","2444":"Port Macquarie, NSW",
  "2450":"Coffs Harbour, NSW","2452":"Sawtell, NSW","2455":"Bellingen, NSW",
  "2460":"Grafton, NSW","2464":"Yamba, NSW","2470":"Lismore, NSW",
  "2471":"Ballina, NSW","2472":"Alstonville, NSW","2477":"Ballina, NSW",
  "2478":"Byron Bay, NSW","2479":"Bangalow, NSW","2480":"Lismore, NSW",
  "2481":"Nimbin, NSW","2482":"Mullumbimby, NSW","2483":"Byron Bay, NSW",
  "2484":"Murwillumbah, NSW","2485":"Tweed Heads, NSW","2486":"Tweed Heads South, NSW",
  "2487":"Banora Point, NSW","2489":"Pottsville, NSW",
  "2500":"Wollongong, NSW","2502":"Fairy Meadow, NSW","2505":"Port Kembla, NSW",
  "2506":"Warrawong, NSW","2515":"Helensburgh, NSW","2516":"Thirroul, NSW",
  "2517":"Bulli, NSW","2518":"Corrimal, NSW","2519":"Balgownie, NSW",
  "2520":"Wollongong, NSW","2525":"Dapto, NSW","2526":"Albion Park, NSW",
  "2527":"Shellharbour, NSW","2528":"Blackbutt, NSW","2529":"Oak Flats, NSW",
  "2530":"Dapto, NSW","2533":"Berry, NSW","2534":"Nowra, NSW",
  "2535":"Milton, NSW","2536":"Ulladulla, NSW","2537":"Mollymook, NSW",
  "2540":"Nowra, NSW","2541":"Bomaderry, NSW","2546":"Batemans Bay, NSW",
  "2548":"Narooma, NSW","2550":"Bega, NSW","2551":"Eden, NSW",
  "2560":"Campbelltown, NSW","2563":"Camden, NSW","2564":"Narellan, NSW",
  "2565":"Macquarie Fields, NSW","2566":"Minto, NSW","2567":"Ingleburn, NSW",
  "2568":"Leumeah, NSW","2570":"Camden, NSW","2575":"Mittagong, NSW",
  "2576":"Bowral, NSW","2577":"Moss Vale, NSW","2578":"Bundanoon, NSW",
  "2580":"Goulburn, NSW","2582":"Marulan, NSW","2585":"Young, NSW",
  "2586":"Cootamundra, NSW","2590":"Temora, NSW","2594":"West Wyalong, NSW",
  // ── ACT ──
  "2600":"Canberra, ACT","2601":"Civic, ACT","2602":"Ainslie, ACT",
  "2603":"Griffith, ACT","2604":"Narrabundah, ACT","2605":"Woden Valley, ACT",
  "2606":"Weston Creek, ACT","2607":"Tuggeranong, ACT","2609":"Fyshwick, ACT",
  "2610":"Pearce, ACT","2611":"Weston Creek, ACT","2612":"Braddon, ACT",
  "2614":"Bruce, ACT","2615":"Belconnen, ACT","2616":"Evatt, ACT",
  "2617":"Giralang, ACT","2618":"Hall, ACT","2620":"Queanbeyan, NSW",
  // ── NSW (continued) ──
  "2640":"Albury, NSW","2641":"North Albury, NSW","2650":"Wagga Wagga, NSW",
  "2670":"Griffith, NSW","2680":"Leeton, NSW","2740":"Penrith, NSW",
  "2745":"St Marys, NSW","2750":"Penrith, NSW","2752":"Windsor, NSW",
  "2753":"Richmond, NSW","2756":"Windsor, NSW","2760":"Rooty Hill, NSW",
  "2763":"Quakers Hill, NSW","2765":"Riverstone, NSW","2770":"Mount Druitt, NSW",
  // ── VIC ── (verified from postcodes-australia.com)
  "3000":"Melbourne CBD, VIC","3001":"Melbourne, VIC","3002":"East Melbourne, VIC",
  "3003":"West Melbourne, VIC","3004":"Melbourne, VIC","3005":"World Trade Centre, VIC",
  "3006":"Southbank, VIC","3008":"Docklands, VIC","3010":"University of Melbourne, VIC",
  "3011":"Footscray, VIC","3012":"West Footscray, VIC","3013":"Yarraville, VIC",
  "3015":"Newport, VIC","3016":"Williamstown, VIC","3018":"Altona, VIC",
  "3019":"Braybrook, VIC","3020":"Sunshine, VIC","3021":"St Albans, VIC",
  "3022":"Ardeer, VIC","3023":"Caroline Springs, VIC","3024":"Wyndham Vale, VIC",
  "3025":"Altona North, VIC","3026":"Laverton North, VIC","3027":"Laverton, VIC",
  "3028":"Altona Meadows, VIC","3029":"Hoppers Crossing, VIC","3030":"Point Cook, VIC",
  "3031":"Flemington, VIC","3032":"Ascot Vale, VIC","3033":"Keilor East, VIC",
  "3034":"Avondale Heights, VIC","3036":"Keilor, VIC","3037":"Sydenham, VIC",
  "3038":"Keilor Downs, VIC","3039":"Moonee Ponds, VIC","3040":"Essendon, VIC",
  "3041":"Strathmore, VIC","3042":"Airport West, VIC","3043":"Tullamarine, VIC",
  "3044":"Pascoe Vale, VIC","3045":"Melbourne Airport, VIC","3046":"Glenroy, VIC",
  "3047":"Broadmeadows, VIC","3048":"Meadow Heights, VIC","3049":"Westmeadows, VIC",
  "3050":"Royal Melbourne Hospital, VIC","3051":"North Melbourne, VIC","3052":"Parkville, VIC",
  "3053":"Carlton, VIC","3054":"Carlton North, VIC","3055":"Brunswick West, VIC",
  "3056":"Brunswick, VIC","3057":"Brunswick East, VIC","3058":"Coburg, VIC",
  "3059":"Greenvale, VIC","3060":"Fawkner, VIC","3061":"Campbellfield, VIC",
  "3062":"Somerton, VIC","3063":"Yuroke, VIC","3064":"Craigieburn, VIC",
  "3065":"Fitzroy, VIC","3066":"Collingwood, VIC","3067":"Abbotsford, VIC",
  "3068":"Clifton Hill, VIC","3070":"Northcote, VIC","3071":"Thornbury, VIC",
  "3072":"Preston, VIC","3073":"Reservoir, VIC","3074":"Thomastown, VIC",
  "3075":"Lalor, VIC","3076":"Epping, VIC","3078":"Alphington, VIC",
  "3079":"Ivanhoe, VIC","3081":"Heidelberg West, VIC","3082":"Mill Park, VIC",
  "3083":"Bundoora, VIC","3084":"Heidelberg, VIC","3085":"Macleod, VIC",
  "3086":"La Trobe University, VIC","3087":"Watsonia, VIC","3088":"Greensborough, VIC",
  "3089":"Diamond Creek, VIC","3090":"Plenty, VIC","3091":"Yarrambat, VIC",
  "3093":"Lower Plenty, VIC","3094":"Montmorency, VIC","3095":"Eltham, VIC",
  "3096":"Wattle Glen, VIC","3097":"Kangaroo Ground, VIC","3099":"Hurstbridge, VIC",
  "3101":"Kew, VIC","3102":"Kew East, VIC","3103":"Balwyn, VIC",
  "3104":"Balwyn North, VIC","3105":"Bulleen, VIC","3106":"Templestowe, VIC",
  "3107":"Templestowe Lower, VIC","3108":"Doncaster, VIC","3109":"Doncaster East, VIC",
  "3111":"Donvale, VIC","3113":"Warrandyte, VIC","3114":"Park Orchards, VIC",
  "3115":"Wonga Park, VIC","3116":"Chirnside Park, VIC",
  "3121":"Richmond, VIC","3122":"Hawthorn, VIC","3123":"Hawthorn East, VIC",
  "3124":"Camberwell, VIC","3125":"Burwood, VIC","3126":"Canterbury, VIC",
  "3127":"Surrey Hills, VIC","3128":"Box Hill, VIC","3129":"Box Hill North, VIC",
  "3130":"Blackburn, VIC","3131":"Nunawading, VIC","3132":"Mitcham, VIC",
  "3133":"Vermont, VIC","3134":"Ringwood, VIC","3135":"Ringwood East, VIC",
  "3136":"Croydon, VIC","3137":"Kilsyth, VIC","3138":"Mooroolbark, VIC",
  "3139":"Lilydale, VIC","3140":"Lilydale, VIC","3141":"South Yarra, VIC",
  "3142":"Toorak, VIC","3143":"Armadale, VIC","3144":"Malvern, VIC",
  "3145":"Malvern East, VIC","3146":"Glen Iris, VIC","3147":"Ashburton, VIC",
  "3148":"Chadstone, VIC","3149":"Mount Waverley, VIC","3150":"Glen Waverley, VIC",
  "3151":"Burwood East, VIC","3152":"Wantirna, VIC","3153":"Bayswater, VIC",
  "3154":"The Basin, VIC","3155":"Boronia, VIC","3156":"Ferntree Gully, VIC",
  "3158":"Upwey, VIC","3159":"Selby, VIC","3160":"Belgrave, VIC",
  "3161":"Caulfield North, VIC","3162":"Caulfield, VIC","3163":"Carnegie, VIC",
  "3164":"Dandenong South, VIC","3165":"Bentleigh East, VIC","3166":"Oakleigh, VIC",
  "3167":"Oakleigh South, VIC","3168":"Clayton, VIC","3169":"Clayton South, VIC",
  "3170":"Mulgrave, VIC","3171":"Springvale, VIC","3172":"Springvale South, VIC",
  "3173":"Keysborough, VIC","3174":"Noble Park, VIC","3175":"Dandenong, VIC",
  "3177":"Doveton, VIC","3178":"Rowville, VIC","3179":"Scoresby, VIC",
  "3180":"Knoxfield, VIC","3181":"Prahran, VIC","3182":"St Kilda, VIC",
  "3183":"St Kilda East, VIC","3184":"Elwood, VIC","3185":"Elsternwick, VIC",
  "3186":"Brighton, VIC","3187":"Brighton East, VIC","3188":"Hampton, VIC",
  "3189":"Moorabbin, VIC","3190":"Highett, VIC","3191":"Sandringham, VIC",
  "3192":"Cheltenham, VIC","3193":"Black Rock, VIC","3194":"Mentone, VIC",
  "3195":"Mordialloc, VIC","3196":"Chelsea, VIC","3197":"Patterson Lakes, VIC",
  "3198":"Seaford, VIC","3199":"Frankston, VIC","3200":"Frankston North, VIC",
  "3201":"Carrum Downs, VIC","3202":"Heatherton, VIC","3204":"Bentleigh, VIC",
  "3205":"South Melbourne, VIC","3206":"Albert Park, VIC","3207":"Port Melbourne, VIC",
  "3211":"Little River, VIC","3212":"Lara, VIC","3214":"Corio, VIC",
  "3215":"North Geelong, VIC","3216":"Highton, VIC","3217":"Deakin University, VIC",
  "3218":"Geelong West, VIC","3219":"East Geelong, VIC","3220":"Geelong, VIC",
  "3221":"Lovely Banks, VIC","3222":"Drysdale, VIC","3223":"Portarlington, VIC",
  "3224":"Leopold, VIC","3225":"Queenscliff, VIC","3226":"Ocean Grove, VIC",
  "3227":"Barwon Heads, VIC","3228":"Torquay, VIC","3230":"Anglesea, VIC",
  "3231":"Aireys Inlet, VIC","3232":"Lorne, VIC","3233":"Apollo Bay, VIC",
  "3240":"Moriac, VIC","3241":"Winchelsea, VIC",
  "3280":"Warrnambool, VIC","3283":"Port Fairy, VIC","3285":"Portland, VIC",
  "3300":"Hamilton, VIC","3350":"Ballarat, VIC","3355":"Wendouree, VIC",
  "3360":"Ararat, VIC","3370":"Maryborough, VIC","3377":"Stawell, VIC",
  "3380":"Horsham, VIC","3390":"Warracknabeal, VIC","3400":"Horsham, VIC",
  "3444":"Kyneton, VIC","3450":"Castlemaine, VIC","3460":"Daylesford, VIC",
  "3461":"Hepburn Springs, VIC","3462":"Creswick, VIC","3465":"Maryborough, VIC",
  "3470":"St Arnaud, VIC","3500":"Mildura, VIC","3550":"Bendigo, VIC",
  "3551":"White Hills, VIC","3552":"Kangaroo Flat, VIC","3555":"Golden Square, VIC",
  "3564":"Rochester, VIC","3579":"Kerang, VIC","3585":"Swan Hill, VIC",
  "3620":"Shepparton, VIC","3630":"Shepparton, VIC","3635":"Kyabram, VIC",
  "3638":"Echuca, VIC","3644":"Yarrawonga, VIC","3649":"Cobram, VIC",
  "3660":"Seymour, VIC","3670":"Benalla, VIC","3675":"Wangaratta, VIC",
  "3690":"Wodonga, VIC","3694":"Wodonga, VIC","3695":"Rutherglen, VIC",
  "3697":"Mount Beauty, VIC","3699":"Bright, VIC","3700":"Corryong, VIC",
  "3713":"Alexandra, VIC","3714":"Eildon, VIC","3715":"Mansfield, VIC",
  "3740":"Bairnsdale, VIC","3741":"Paynesville, VIC","3742":"Lakes Entrance, VIC",
  "3750":"South Morang, VIC","3752":"South Morang, VIC","3753":"Doreen, VIC",
  "3754":"Mernda, VIC","3755":"Epping, VIC","3756":"Whittlesea, VIC",
  "3757":"Wallan, VIC","3758":"Kilmore, VIC","3759":"Broadford, VIC",
  "3760":"Yea, VIC","3765":"Healesville, VIC","3770":"Yarra Glen, VIC",
  "3781":"Pakenham, VIC","3782":"Gembrook, VIC","3783":"Cockatoo, VIC",
  "3785":"Berwick, VIC","3787":"Beaconsfield, VIC","3789":"Narre Warren, VIC",
  "3791":"Hampton Park, VIC","3792":"Endeavour Hills, VIC","3793":"Cranbourne, VIC",
  "3795":"Clyde, VIC","3800":"Monash University, VIC","3805":"Narre Warren, VIC",
  "3806":"Berwick, VIC","3807":"Beaconsfield, VIC","3808":"Pakenham, VIC",
  "3810":"Pakenham Upper, VIC","3812":"Bunyip, VIC","3813":"Drouin, VIC",
  "3814":"Warragul, VIC","3818":"Moe, VIC","3820":"Traralgon, VIC",
  "3825":"Sale, VIC","3840":"Bairnsdale, VIC",
  // ── QLD ──
  "4000":"Brisbane CBD, QLD","4001":"Brisbane, QLD","4005":"New Farm, QLD",
  "4006":"Fortitude Valley, QLD","4007":"Hamilton, QLD","4010":"Albion, QLD",
  "4011":"Clayfield, QLD","4012":"Nundah, QLD","4013":"Northgate, QLD",
  "4014":"Banyo, QLD","4017":"Brighton, QLD","4018":"Bracken Ridge, QLD",
  "4019":"Redcliffe, QLD","4020":"Redcliffe, QLD","4021":"Clontarf, QLD",
  "4029":"Herston, QLD","4030":"Lutwyche, QLD","4031":"Gordon Park, QLD",
  "4032":"Chermside, QLD","4033":"Aspley, QLD","4034":"Carseldine, QLD",
  "4035":"Bald Hills, QLD","4036":"Bridgeman Downs, QLD","4037":"Warner, QLD",
  "4051":"Stafford, QLD","4052":"Enoggera, QLD","4053":"Mitchelton, QLD",
  "4054":"The Gap, QLD","4055":"Keperra, QLD","4056":"Everton Park, QLD",
  "4059":"Kelvin Grove, QLD","4060":"Red Hill, QLD","4061":"Ashgrove, QLD",
  "4064":"Milton, QLD","4065":"Chapel Hill, QLD","4066":"Toowong, QLD",
  "4067":"St Lucia, QLD","4068":"Indooroopilly, QLD","4069":"Kenmore, QLD",
  "4072":"St Lucia, QLD","4073":"Corinda, QLD","4074":"Oxley, QLD",
  "4075":"Graceville, QLD","4076":"Darra, QLD","4077":"Richlands, QLD",
  "4078":"Forest Lake, QLD","4101":"South Brisbane, QLD","4102":"Woolloongabba, QLD",
  "4103":"Greenslopes, QLD","4104":"Yeronga, QLD","4105":"Moorooka, QLD",
  "4106":"Salisbury, QLD","4107":"Rocklea, QLD","4108":"Coopers Plains, QLD",
  "4109":"Sunnybank, QLD","4110":"Acacia Ridge, QLD","4111":"Holland Park, QLD",
  "4112":"Kuraby, QLD","4113":"Eight Mile Plains, QLD","4114":"Logan Central, QLD",
  "4115":"Parkinson, QLD","4116":"Calamvale, QLD","4118":"Park Ridge, QLD",
  "4119":"Stretton, QLD","4120":"Greenslopes, QLD","4121":"Holland Park West, QLD",
  "4122":"Robertson, QLD","4123":"Mansfield, QLD","4124":"Browns Plains, QLD",
  "4125":"Regents Park, QLD","4127":"Springwood, QLD","4128":"Shailer Park, QLD",
  "4129":"Tanah Merah, QLD","4130":"Cornubia, QLD","4131":"Loganholme, QLD",
  "4132":"Meadowbrook, QLD","4133":"Marsden, QLD","4151":"Coorparoo, QLD",
  "4152":"Camp Hill, QLD","4153":"Carindale, QLD","4154":"Gumdale, QLD",
  "4155":"Chandler, QLD","4156":"Mackenzie, QLD","4157":"Cleveland, QLD",
  "4158":"Thornlands, QLD","4159":"Birkdale, QLD","4160":"Wellington Point, QLD",
  "4161":"Alexandra Hills, QLD","4163":"Cleveland, QLD","4165":"Redland Bay, QLD",
  "4169":"East Brisbane, QLD","4170":"Cannon Hill, QLD","4171":"Balmoral, QLD",
  "4172":"Murarrie, QLD","4173":"Tingalpa, QLD","4178":"Manly West, QLD",
  "4179":"Manly, QLD","4205":"Beenleigh, QLD","4207":"Yatala, QLD",
  "4208":"Ormeau, QLD","4209":"Coomera, QLD","4210":"Oxenford, QLD",
  "4211":"Upper Coomera, QLD","4212":"Helensvale, QLD","4213":"Nerang, QLD",
  "4214":"Carrara, QLD","4215":"Surfers Paradise, QLD","4216":"Labrador, QLD",
  "4217":"Surfers Paradise, QLD","4218":"Mermaid Beach, QLD","4219":"Burleigh Heads, QLD",
  "4220":"Burleigh Heads, QLD","4221":"Palm Beach, QLD","4222":"Currumbin, QLD",
  "4223":"Tallebudgera, QLD","4224":"Coolangatta, QLD","4226":"Robina, QLD",
  "4227":"Varsity Lakes, QLD","4229":"Mudgeeraba, QLD","4270":"Jimboomba, QLD",
  "4280":"Beaudesert, QLD","4300":"Springfield, QLD","4301":"Goodna, QLD",
  "4303":"Ipswich, QLD","4305":"Ipswich, QLD","4306":"Ripley, QLD",
  "4340":"Laidley, QLD","4341":"Gatton, QLD","4350":"Toowoomba, QLD",
  "4370":"Warwick, QLD","4400":"Dalby, QLD","4410":"Roma, QLD",
  "4420":"Charleville, QLD","4500":"Strathpine, QLD","4501":"Brendale, QLD",
  "4502":"Lawnton, QLD","4503":"Mango Hill, QLD","4505":"Caboolture, QLD",
  "4506":"Morayfield, QLD","4507":"Bribie Island, QLD","4508":"Narangba, QLD",
  "4509":"North Lakes, QLD","4510":"Caboolture, QLD","4512":"Woodford, QLD",
  "4515":"Maleny, QLD","4550":"Caloundra, QLD","4551":"Currimundi, QLD",
  "4556":"Mooloolaba, QLD","4557":"Maroochydore, QLD","4558":"Buderim, QLD",
  "4559":"Nambour, QLD","4560":"Nambour, QLD","4562":"Noosaville, QLD",
  "4563":"Tewantin, QLD","4564":"Noosa Heads, QLD","4565":"Pomona, QLD",
  "4570":"Gympie, QLD","4600":"Kingaroy, QLD","4620":"Maryborough, QLD",
  "4670":"Bundaberg, QLD","4680":"Gladstone, QLD","4700":"Rockhampton, QLD",
  "4703":"Yeppoon, QLD","4740":"Mackay, QLD","4800":"Proserpine, QLD",
  "4802":"Bowen, QLD","4810":"Townsville, QLD","4814":"Townsville, QLD",
  "4817":"Thuringowa, QLD","4820":"Charters Towers, QLD","4825":"Mount Isa, QLD",
  "4850":"Ingham, QLD","4860":"Cardwell, QLD","4868":"Cairns South, QLD",
  "4869":"Cairns, QLD","4870":"Cairns, QLD","4872":"Atherton, QLD",
  "4873":"Mossman, QLD","4875":"Cooktown, QLD","4877":"Port Douglas, QLD",
  "4878":"Smithfield, QLD","4879":"Kuranda, QLD","4880":"Mareeba, QLD",
  // ── SA ──
  "5000":"Adelaide CBD, SA","5001":"Adelaide, SA","5006":"North Adelaide, SA",
  "5007":"Bowden, SA","5008":"Renown Park, SA","5009":"Beverley, SA",
  "5010":"Mansfield Park, SA","5011":"Woodville, SA","5014":"Hendon, SA",
  "5015":"Port Adelaide, SA","5016":"Ethelton, SA","5018":"Semaphore, SA",
  "5019":"Grange, SA","5020":"West Lakes, SA","5021":"West Lakes Shore, SA",
  "5022":"Henley Beach, SA","5023":"Findon, SA","5024":"Seaton, SA",
  "5025":"Flinders Park, SA","5031":"Mile End, SA","5032":"Cowandilla, SA",
  "5033":"Marleston, SA","5034":"Goodwood, SA","5035":"Keswick, SA",
  "5036":"Edwardstown, SA","5037":"Camden Park, SA","5038":"Plympton, SA",
  "5039":"Mitchell Park, SA","5040":"Novar Gardens, SA","5041":"Pasadena, SA",
  "5042":"O'Halloran Hill, SA","5043":"Marion, SA","5044":"Somerton Park, SA",
  "5045":"Glenelg, SA","5046":"Oaklands Park, SA","5047":"Morphettville, SA",
  "5048":"Hove, SA","5049":"Seacliff, SA","5050":"Blackwood, SA",
  "5051":"Hawthorndene, SA","5052":"Coromandel Valley, SA","5061":"Unley, SA",
  "5062":"Springfield, SA","5063":"Millswood, SA","5064":"Myrtle Bank, SA",
  "5065":"Burnside, SA","5066":"Beaumont, SA","5067":"Norwood, SA",
  "5068":"Kensington, SA","5069":"Maylands, SA","5070":"Firle, SA",
  "5072":"Burnside, SA","5073":"Campbelltown, SA","5074":"Tranmere, SA",
  "5075":"Newton, SA","5076":"Athelstone, SA","5081":"Prospect, SA",
  "5082":"Blair Athol, SA","5083":"Enfield, SA","5084":"Ferryden Park, SA",
  "5085":"Clearview, SA","5086":"Northfield, SA","5090":"Tea Tree Gully, SA",
  "5091":"Modbury, SA","5092":"Golden Grove, SA","5093":"Modbury Heights, SA",
  "5094":"Para Hills, SA","5095":"Ingle Farm, SA","5096":"Para Vista, SA",
  "5097":"Redwood Park, SA","5098":"Salisbury, SA","5107":"Salisbury, SA",
  "5108":"Salisbury, SA","5109":"Salisbury, SA","5110":"Salisbury, SA",
  "5111":"Elizabeth, SA","5112":"Elizabeth, SA","5113":"Smithfield, SA",
  "5114":"Munno Para, SA","5115":"Angle Vale, SA","5116":"Gawler, SA",
  "5118":"Gawler, SA","5120":"Two Wells, SA","5121":"Virginia, SA",
  "5153":"Stirling, SA","5154":"Aldgate, SA","5155":"Bridgewater, SA",
  "5156":"Hahndorf, SA","5158":"Noarlunga, SA","5159":"Christie's Beach, SA",
  "5160":"Hackham, SA","5161":"Morphett Vale, SA","5162":"Reynella, SA",
  "5163":"Aldinga Beach, SA","5169":"Seaford, SA","5170":"Port Noarlunga, SA",
  "5171":"McLaren Vale, SA","5172":"Willunga, SA","5173":"Sellicks Beach, SA",
  "5200":"Murray Bridge, SA","5210":"Victor Harbor, SA","5211":"Port Elliot, SA",
  "5212":"Goolwa, SA","5220":"Kangaroo Island, SA","5221":"Kingscote, SA",
  "5231":"Norton Summit, SA","5232":"Lobethal, SA","5240":"Kersbrook, SA",
  "5241":"Lenswood, SA","5245":"Nairne, SA","5250":"Murray Bridge, SA",
  "5253":"Strathalbyn, SA","5275":"Mt Gambier, SA","5276":"Millicent, SA",
  "5277":"Mt Gambier, SA","5280":"Bordertown, SA","5310":"Loxton, SA",
  "5311":"Berri, SA","5320":"Renmark, SA","5350":"Nuriootpa, SA",
  "5351":"Angaston, SA","5352":"Tanunda, SA","5355":"Kapunda, SA",
  "5380":"Clare, SA","5400":"Gawler, SA","5411":"Kadina, SA",
  "5412":"Wallaroo, SA","5413":"Moonta, SA","5420":"Crystal Brook, SA",
  "5421":"Port Pirie, SA","5431":"Port Augusta, SA","5432":"Whyalla, SA",
  "5440":"Port Augusta, SA","5490":"Coober Pedy, SA",
  // ── WA ──
  "6000":"Perth CBD, WA","6001":"Perth, WA","6003":"Northbridge, WA",
  "6004":"East Perth, WA","6005":"West Perth, WA","6006":"North Perth, WA",
  "6007":"Leederville, WA","6008":"Subiaco, WA","6009":"Nedlands, WA",
  "6010":"Claremont, WA","6011":"Cottesloe, WA","6012":"Mosman Park, WA",
  "6014":"Floreat, WA","6015":"City Beach, WA","6016":"Mount Hawthorn, WA",
  "6017":"Osborne Park, WA","6018":"Karrinyup, WA","6019":"Innaloo, WA",
  "6020":"Scarborough, WA","6021":"Balga, WA","6022":"Mirrabooka, WA",
  "6023":"Duncraig, WA","6024":"Carine, WA","6025":"Craigie, WA",
  "6026":"Kingsley, WA","6027":"Currambine, WA","6028":"Burns Beach, WA",
  "6029":"Butler, WA","6030":"Clarkson, WA","6031":"Merriwa, WA",
  "6036":"Alkimos, WA","6037":"Two Rocks, WA","6050":"Inglewood, WA",
  "6051":"Maylands, WA","6052":"Bayswater, WA","6053":"Bassendean, WA",
  "6054":"Midland, WA","6055":"Midvale, WA","6056":"Swan View, WA",
  "6057":"Bellevue, WA","6058":"Morley, WA","6059":"Dianella, WA",
  "6060":"Tuart Hill, WA","6061":"Girrawheen, WA","6062":"Nollamara, WA",
  "6063":"Noranda, WA","6064":"Balga, WA","6065":"Wanneroo, WA",
  "6066":"Madeley, WA","6067":"Landsdale, WA","6069":"Ellenbrook, WA",
  "6070":"Mundaring, WA","6076":"Kalamunda, WA","6078":"Lesmurdie, WA",
  "6081":"Wattle Grove, WA","6082":"Forrestfield, WA","6083":"High Wycombe, WA",
  "6090":"Malaga, WA","6100":"Victoria Park, WA","6101":"Lathlain, WA",
  "6102":"Carlisle, WA","6103":"Bentley, WA","6104":"Ascot, WA",
  "6105":"Redcliffe, WA","6106":"Welshpool, WA","6107":"Cannington, WA",
  "6108":"Beckenham, WA","6109":"Maddington, WA","6110":"Gosnells, WA",
  "6111":"Kenwick, WA","6112":"Thornlie, WA","6113":"Southern River, WA",
  "6147":"Langford, WA","6148":"Lynwood, WA","6149":"Parkwood, WA",
  "6150":"Murdoch, WA","6151":"Como, WA","6152":"South Perth, WA",
  "6153":"Applecross, WA","6154":"Ardross, WA","6155":"Winthrop, WA",
  "6156":"Fremantle, WA","6157":"East Fremantle, WA","6158":"North Fremantle, WA",
  "6160":"Fremantle, WA","6161":"Beaconsfield, WA","6162":"Palmyra, WA",
  "6163":"Spearwood, WA","6164":"Bibra Lake, WA","6165":"Kardinya, WA",
  "6166":"Yangebup, WA","6167":"Cockburn Central, WA","6168":"Baldivis, WA",
  "6169":"Warnbro, WA","6170":"Rockingham, WA","6171":"Safety Bay, WA",
  "6172":"Kwinana, WA","6173":"Medina, WA","6175":"Wellard, WA",
  "6180":"Greenfields, WA","6210":"Mandurah, WA","6211":"Dawesville, WA",
  "6214":"Waroona, WA","6215":"Harvey, WA","6220":"Bunbury, WA",
  "6221":"Australind, WA","6225":"Collie, WA","6230":"Bunbury, WA",
  "6243":"Bridgetown, WA","6255":"Manjimup, WA","6256":"Pemberton, WA",
  "6271":"Dunsborough, WA","6280":"Busselton, WA","6281":"Yallingup, WA",
  "6282":"Cowaramup, WA","6284":"Margaret River, WA","6285":"Augusta, WA",
  "6330":"Albany, WA","6333":"Denmark, WA","6336":"Katanning, WA",
  "6338":"Narrogin, WA","6350":"Williams, WA","6383":"York, WA",
  "6390":"Northam, WA","6391":"Toodyay, WA","6395":"Wongan Hills, WA",
  "6400":"Northam, WA","6430":"Kalgoorlie, WA","6431":"Boulder, WA",
  "6432":"Kambalda, WA","6440":"Coolgardie, WA","6450":"Esperance, WA",
  "6530":"Geraldton, WA","6535":"Kalbarri, WA","6536":"Northampton, WA",
  "6560":"Meekatharra, WA","6700":"Carnarvon, WA","6705":"Exmouth, WA",
  "6710":"Karratha, WA","6714":"Karratha, WA","6720":"Dampier, WA",
  "6721":"Port Hedland, WA","6725":"Broome, WA","6726":"Cable Beach, WA",
  "6728":"Derby, WA","6743":"Kununurra, WA","6751":"Halls Creek, WA",
  "6753":"Tom Price, WA","6754":"Paraburdoo, WA","6758":"Newman, WA",
  // ── TAS ──
  "7000":"Hobart CBD, TAS","7001":"Hobart, TAS","7004":"Battery Point, TAS",
  "7005":"Lower Sandy Bay, TAS","7007":"Sandy Bay, TAS","7008":"Dynnyrne, TAS",
  "7009":"Glebe, TAS","7010":"New Town, TAS","7011":"Moonah, TAS",
  "7012":"Glenorchy, TAS","7015":"Risdon Vale, TAS","7016":"Rokeby, TAS",
  "7018":"Howrah, TAS","7019":"Tranmere, TAS","7020":"Lauderdale, TAS",
  "7022":"Clifton Beach, TAS","7025":"Sorell, TAS","7026":"Midway Point, TAS",
  "7027":"Orford, TAS","7030":"Brighton, TAS","7050":"Kingston, TAS",
  "7051":"Blackmans Bay, TAS","7052":"Margate, TAS","7054":"Huonville, TAS",
  "7109":"Huonville, TAS","7110":"Geeveston, TAS","7112":"Dover, TAS",
  "7116":"Port Arthur, TAS","7120":"Richmond, TAS","7140":"New Norfolk, TAS",
  "7162":"Queenstown, TAS","7163":"Strahan, TAS","7170":"Bellerive, TAS",
  "7171":"Lindisfarne, TAS","7172":"Rose Bay, TAS","7173":"Acton Park, TAS",
  "7174":"Rokeby, TAS","7175":"Lauderdale, TAS","7176":"Sandford, TAS",
  "7177":"Carlton, TAS","7178":"Cambridge, TAS","7179":"Richmond, TAS",
  "7180":"Sorell, TAS","7182":"Dunalley, TAS","7183":"Orford, TAS",
  "7184":"Swansea, TAS","7185":"Bicheno, TAS","7187":"St Helens, TAS",
  "7190":"St Marys, TAS","7200":"Launceston, TAS","7210":"Launceston, TAS",
  "7212":"Ravenswood, TAS","7214":"Scottsdale, TAS","7215":"Bridport, TAS",
  "7248":"Launceston, TAS","7250":"Launceston, TAS","7252":"Invermay, TAS",
  "7253":"Newnham, TAS","7254":"Kings Meadows, TAS","7255":"Trevallyn, TAS",
  "7259":"Longford, TAS","7260":"Campbell Town, TAS","7261":"Evandale, TAS",
  "7270":"George Town, TAS","7275":"Exeter, TAS","7276":"Beaconsfield, TAS",
  "7290":"Deloraine, TAS","7291":"Westbury, TAS","7305":"Devonport, TAS",
  "7307":"Ulverstone, TAS","7310":"Devonport, TAS","7315":"Port Sorell, TAS",
  "7316":"Latrobe, TAS","7320":"Burnie, TAS","7321":"Ulverstone, TAS",
  "7322":"Penguin, TAS","7325":"Wynyard, TAS","7330":"Smithton, TAS",
  "7331":"Stanley, TAS","7467":"Queenstown, TAS","7468":"Zeehan, TAS",
  "7470":"Queenstown, TAS",
  // ── NT ──
  "0800":"Darwin CBD, NT","0801":"Darwin, NT","0810":"Casuarina, NT",
  "0811":"Nightcliff, NT","0812":"Coconut Grove, NT","0813":"Rapid Creek, NT",
  "0814":"Brinkin, NT","0820":"Darwin, NT","0821":"Palmerston, NT",
  "0822":"Howard Springs, NT","0823":"Humpty Doo, NT","0828":"Batchelor, NT",
  "0830":"Palmerston, NT","0835":"Girraween, NT","0836":"Durack, NT",
  "0837":"Bellamack, NT","0840":"Tennant Creek, NT","0850":"Katherine, NT",
  "0851":"Katherine, NT","0852":"Katherine East, NT","0870":"Alice Springs, NT",
  "0871":"Alice Springs, NT","0872":"Alice Springs, NT","0880":"Nhulunbuy, NT",
};

// Look up suburb for an Australian postcode. Returns a string or null.
function lookupPostcode(code) {
  return AU_POSTCODES[code.trim()] || null;
}

// ── LoopGen Logo component — use everywhere branding is needed ────────────────
// height: desired display height in px. Width scales automatically (ratio ~1.61:1).
// Works on light or dark backgrounds because the PNG has a transparent background.
function LoopGenLogo({ height = 28, style = {} }) {
  const [err, setErr] = useState(false);
  if (err) {
    // Inline fallback: gradient box + wordmark
    return (
      <div style={{ display:"flex", alignItems:"center", gap:7, ...style }}>
        <div style={{ width:height, height:height, borderRadius:Math.round(height*0.28),
          background:"linear-gradient(135deg,#1c7c45,#22c55e)",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0 }}>
          <span style={{ color:"white", fontWeight:900,
            fontSize:Math.round(height*0.5) }}>L</span>
        </div>
        <span style={{ fontSize:Math.round(height*0.56), fontWeight:800,
          color:"#111", letterSpacing:-0.3 }}>LoopGen</span>
      </div>
    );
  }
  return (
    <img
      src="/loopgen-logo.png"
      alt="LoopGen"
      onError={() => setErr(true)}
      style={{
        height,
        width: "auto",
        maxWidth: height * 2.8,
        display: "block",
        objectFit: "contain",
        flexShrink: 0,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
        ...style,
      }}
    />
  );
}

// ── DEMO SELLER PROFILES ─────────────────────────────────────────
// Five curated demo sellers, each with a distinct niche identity
const DEMO_SELLERS = {
  VintageHunter: {
    username: "VintageHunter",
    bio: "Sourcing pre-loved treasures across Melbourne's op-shops & markets. Specialising in film cameras, vinyl, and retro tech. 🎞️",
    location: "Fitzroy, VIC",
    joined: "Jan 2023",
    rating: 4.9,
    avatar_initial: "V",
  },
  RetroCollector: {
    username: "RetroCollector",
    bio: "Sydney's go-to for retro gaming gear. PS1, N64, SNES — if it's got cartridges, I've probably got it. 🎮",
    location: "Newtown, NSW",
    joined: "Mar 2022",
    rating: 4.8,
    avatar_initial: "R",
  },
  StreetwearArchive: {
    username: "StreetwearArchive",
    bio: "Curating archive streetwear, 90s sportswear & Y2K fashion from Sydney. Deadstock and vintage only. 👟",
    location: "Surry Hills, NSW",
    joined: "Jun 2023",
    rating: 4.7,
    avatar_initial: "S",
  },
  FilmCameraClub: {
    username: "FilmCameraClub",
    bio: "Analog photography enthusiast. Selling and trading 35mm + medium format cameras, lenses & darkroom gear. 📸",
    location: "Glebe, NSW",
    joined: "Sep 2021",
    rating: 5.0,
    avatar_initial: "F",
  },
  RetroGamesStore: {
    username: "RetroGamesStore",
    bio: "Brisbane's largest private retro game collection. Tested, cleaned, and ready to play. No fakes, no repros. 🕹️",
    location: "Newstead, QLD",
    joined: "Feb 2022",
    rating: 4.8,
    avatar_initial: "G",
  },
};

// ── DEMO LISTINGS — 30 items across 5 categories ────────────────
// Vintage & Collectibles (12 items)
const DEMO_VINTAGE = [
  { id:"v1",  title:"Vintage Polaroid OneStep Camera",         price:85,  category:"Vintage & Collectibles", sub:"Polaroid Cameras",    condition:"Good",     location:"Fitzroy, VIC",        seller_username:"VintageHunter",    rating:4.9, time:"1h ago",  image_urls:["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"], is_saved:false, tags:["Vintage","Collector"],          description:"Original Polaroid OneStep in great working condition. Tested with fresh 600 film — colours are vibrant. Minor cosmetic wear on the body, nothing affecting function. Comes with original strap." },
  { id:"v2",  title:"Retro PlayStation 1 + 2 Controllers",     price:120, category:"Vintage & Collectibles", sub:"Retro Games",          condition:"Good",     location:"Newtown, NSW",        seller_username:"RetroCollector",   rating:4.8, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80"], is_saved:false, tags:["Retro","90s","Collector"],      description:"OG PlayStation 1 (SCPH-7002) with 2 original Sony controllers. Fully tested, plays CDs perfectly. Controllers have zero stick drift. No memory card but easy to grab one cheap." },
  { id:"v3",  title:"90s Nike Windbreaker Jacket – Size M",    price:60,  category:"Vintage & Collectibles", sub:"Vintage Clothing",     condition:"Used",     location:"Surry Hills, NSW",    seller_username:"StreetwearArchive",rating:4.7, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80"], is_saved:false, tags:["90s","Y2K","Vintage"],          description:"Authentic 90s Nike windbreaker in classic navy/white/red colourway. Size M, fits true to size. Light pilling on cuffs consistent with age. Rare colourway you won't find anymore." },
  { id:"v4",  title:"Lord of the Rings Extended DVD Box Set",  price:25,  category:"Vintage & Collectibles", sub:"DVD / Blu-ray",        condition:"Like New", location:"Fremantle, WA",      seller_username:"VintageHunter",    rating:4.9, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=600&q=80"], is_saved:false, tags:["Collector","Limited Edition"],  description:"Complete LOTR Extended Edition 4-film box set. All discs play perfectly, no scratches. Bonus appendix discs included. The definitive version — theatrical cuts can't compete." },
  { id:"v5",  title:"Vinyl Record – Pink Floyd The Wall",      price:40,  category:"Vintage & Collectibles", sub:"Vinyl Records",        condition:"Good",     location:"Paddington, NSW",     seller_username:"VintageHunter",    rating:4.9, time:"4h ago",  image_urls:["https://images.unsplash.com/photo-1542208998-f6dbbb5b2e6f?w=600&q=80"], is_saved:false, tags:["Vintage","Collector"],          description:"Original double-LP pressing of The Wall. Plays beautifully with minimal surface noise. Sleeve has expected shelf wear. A must-have for any serious vinyl collection." },
  { id:"v6",  title:"Sony Walkman TPS-L2 Cassette Player",    price:95,  category:"Vintage & Collectibles", sub:"Cassette Tapes",       condition:"For Parts", location:"Collingwood, VIC",   seller_username:"VintageHunter",    rating:4.9, time:"6h ago",  image_urls:["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"], is_saved:false, tags:["Retro","Vintage","80s"],        description:"Original Sony Walkman TPS-L2 — the one that started it all. Sold for restoration/display. Belt needs replacing (common issue). Cosmetically excellent, original headphones included." },
  { id:"v7",  title:"Film Camera – Canon AE-1 Program",       price:140, category:"Vintage & Collectibles", sub:"Film Cameras",         condition:"Like New",  location:"Glebe, NSW",         seller_username:"FilmCameraClub",   rating:5.0, time:"8h ago",  image_urls:["https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&q=80"], is_saved:false, tags:["Vintage","Collector"],          description:"Canon AE-1 Program in near-mint condition. Shutter fires crisply at all speeds. Light seals fresh. Comes with Canon FD 50mm f/1.8 lens — deadly sharp. Shot one roll to confirm everything works." },
  { id:"v8",  title:"Y2K Diesel Cargo Pants – Size 32",       price:75,  category:"Vintage & Collectibles", sub:"Vintage Clothing",     condition:"Good",     location:"Fitzroy, VIC",        seller_username:"StreetwearArchive",rating:4.7, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80"], is_saved:false, tags:["Y2K","Vintage"],               description:"Authentic Diesel cargo pants from 2001-ish. Wide leg, multi-pocket, the real Y2K energy. Size 32 waist, 30 inseam. Some fading on knees adding to the vibe. Waistband logo intact." },
  { id:"v9",  title:"Nintendo Game Boy Color – Teal",          price:90,  category:"Vintage & Collectibles", sub:"Retro Games",          condition:"Good",     location:"Newtown, NSW",        seller_username:"RetroCollector",   rating:4.8, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&q=80"], is_saved:false, tags:["Retro","90s","Collector"],      description:"Original teal Game Boy Color in great condition. Screen is clear with no scratches. Sound works on all channels. Comes with Pokémon Yellow — saves are working. Batteries not included." },
  { id:"v10", title:"Vintage Adidas Track Jacket – Size L",   price:70,  category:"Vintage & Collectibles", sub:"Vintage Clothing",     condition:"Good",     location:"Surry Hills, NSW",    seller_username:"StreetwearArchive",rating:4.7, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"], is_saved:false, tags:["Retro","Vintage","90s"],        description:"Three-stripe Adidas track jacket from the late 90s in navy/gold. Trefoil logo, not the modern badge. Size L, roomy fit. Zip is smooth, no holes in lining. Perfect layering piece." },
  { id:"v11", title:"Retro Game Cartridge – Zelda: OoT",      price:45,  category:"Vintage & Collectibles", sub:"Retro Games",          condition:"Good",     location:"Newstead, QLD",       seller_username:"RetroGamesStore",  rating:4.8, time:"4h ago",  image_urls:["https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"], is_saved:false, tags:["Retro","90s","Collector"],      description:"Authentic Zelda: Ocarina of Time N64 cartridge (gold label). Save battery still holds — 3 file slots working. Contacts cleaned, tested on my own N64. Label is in great shape, 9/10." },
  { id:"v12", title:"Skateboard Deck – Santa Cruz Reissue",   price:50,  category:"Vintage & Collectibles", sub:"Collectible Toys",     condition:"Like New", location:"Bondi, NSW",          seller_username:"StreetwearArchive",rating:4.7, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=600&q=80"], is_saved:false, tags:["Retro","Collector"],            description:"Santa Cruz Screaming Hand reissue deck. Never mounted — it would be a crime to skate this. 8.5\" width. Graphics are perfect. Deck-only, trucks not included. For the collector." },
];

// Fashion (6 items)
// Electronics (5 items)
// Home (4 items)
// Sports (3 items)
const DEMO_LISTINGS = [
  // ── Fashion ──────────────────────────────────────────────────
  { id:"f1",  title:"Air Jordan 4 Retro – White Cement",       price:260, category:"Fashion",               sub:"Shoes",               condition:"Good",     location:"Surry Hills, NSW",    seller_username:"StreetwearArchive",rating:4.8, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"], is_saved:false, tags:["Sneakers","Retro","Good","Streetwear"],                              description:"Air Jordan 4 White Cement in a solid 8/10 condition. Some yellowing on the sole which is expected for the age. No creasing on the toe box — stored properly. US10, fits true." },
  { id:"f2",  title:"Nike Dunk Low Panda – Size 10",            price:220, category:"Fashion",               sub:"Shoes",               condition:"Like New", location:"Fortitude Valley, QLD", seller_username:"StreetwearArchive",rating:5.0, time:"4h ago",  image_urls:["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80"], is_saved:false, tags:["Sneakers","Like New","Streetwear"],                              description:"Nike Dunk Low Panda worn twice. Absolutely no creasing, lightly tried on. Comes with original box and both lace sets. Size US10. Selling because I prefer the Black Panda colourway." },
  { id:"f3",  title:"Levi's 501 Original Jeans – W32 L30",     price:65,  category:"Fashion",               sub:"Clothing",            condition:"Good",     location:"Richmond, VIC",       seller_username:"StreetwearArchive",rating:4.7, time:"6h ago",  image_urls:["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80"], is_saved:false, tags:["Fashion","Vintage","Good"],                              description:"Classic Levi's 501s in the original fit. W32 L30. Naturally worn knees and fading — looks incredible, not damaged. Iconic red tab intact. Washed cold and hung, never tumble dried." },
  { id:"f4",  title:"Supreme Box Logo Hoodie – Navy, Size L",   price:310, category:"Fashion",               sub:"Hoodies",             condition:"Good",     location:"Paddington, NSW",     seller_username:"StreetwearArchive",rating:4.7, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80"], is_saved:false, tags:["Fashion","Streetwear","Collector","Good"],                              description:"FW19 Supreme Box Logo Hooded Sweatshirt in Navy. Size Large. Worn maybe 4x, washed once on delicate. Logo is crisp, no cracking. 100% authentic — happy to verify in person." },
  { id:"f5",  title:"Vintage Carhartt WIP Detroit Jacket – M",  price:130, category:"Fashion",               sub:"Jackets",             condition:"Used",     location:"Brunswick, VIC",      seller_username:"StreetwearArchive",rating:4.7, time:"7h ago",  image_urls:["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80"], is_saved:false, tags:["Fashion","Vintage","Streetwear","Used"],                              description:"90s era Carhartt WIP Detroit Jacket in dark brown. Waxed canvas has beautiful patina. All pockets zip/button correctly. Minor wear on cuffs. Size M, slightly boxy. A genuine workhorse." },
  { id:"f6",  title:"New Balance 550 – Grey/White, Size 9.5",   price:150, category:"Fashion",               sub:"Shoes",               condition:"Like New", location:"Newtown, NSW",        seller_username:"StreetwearArchive",rating:4.7, time:"9h ago",  image_urls:["https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80"], is_saved:false, tags:["Sneakers","Like New","Minimal"],                              description:"NB 550 in the grey/white colourway. Worn twice to try sizing — I'm a 9 so these are too big. No creases, soles are clean. Size US9.5. OG box included. Timeless silhouette." },
  // ── Electronics ──────────────────────────────────────────────
  { id:"e1",  title:"Sony Alpha A6400 Camera Body",             price:750, category:"Electronics",           sub:"Cameras",             condition:"Like New", location:"Newstead, QLD",       seller_username:"FilmCameraClub",   rating:5.0, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"], is_saved:false, tags:["Camera","Electronics","Like New"],                              description:"Sony A6400 body, shutter count under 3000 — essentially new. Comes with original battery, charger, strap, and box. Switching to full-frame so this needs a new home. Flawless sensor." },
  { id:"e2",  title:"AirPods Pro 2nd Gen – Like New",           price:195, category:"Electronics",           sub:"Audio",               condition:"Like New", location:"Manly, NSW",          seller_username:"RetroCollector",   rating:4.8, time:"6h ago",  image_urls:["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80"], is_saved:true,  tags:["Electronics","Like New"],                              description:"AirPods Pro Gen 2 purchased 6 months ago. Used lightly — primarily at the gym. All ear tips included, case is unscratched. Battery health still showing 100% in Settings." },
  { id:"e3",  title:"iPad Air 5th Gen – 256GB, Space Grey",     price:550, category:"Electronics",           sub:"Tablets",             condition:"Good",     location:"South Yarra, VIC",    seller_username:"RetroCollector",   rating:4.8, time:"2d ago",  image_urls:["https://images.unsplash.com/photo-1544244015-0df4592ab731?w=600&q=80"], is_saved:false, tags:["Electronics","Good"],                              description:"iPad Air 5 in Space Grey, 256GB WiFi. 87% battery health. No cracks or chips on screen — using a case since day one. Comes with Apple USB-C cable but no charger brick." },
  { id:"e4",  title:"Dyson V11 Cordless Vacuum",                price:280, category:"Electronics",           sub:"Appliances",          condition:"Good",     location:"Camberwell, VIC",     seller_username:"VintageHunter",    rating:4.9, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80"], is_saved:false, tags:["Electronics","Good"],                              description:"Dyson V11 Animal in good working order. 45-55 min runtime on eco mode. Comes with all attachments and docking station. One small crack on the bin (non-structural). Cleaned thoroughly." },
  { id:"e5",  title:"Nintendo Switch OLED – White",             price:320, category:"Electronics",           sub:"Gaming Consoles",     condition:"Like New", location:"Newstead, QLD",       seller_username:"RetroGamesStore",  rating:4.8, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80"], is_saved:false, tags:["Gaming","Electronics","Like New"],                              description:"Switch OLED in white, used for 4 months. Screen is perfect — no dead pixels or burn-in. Dock, HDMI, Joy-Cons and USB-C charger all included. No Joy-Con drift. Comes with carrying case." },
  // ── Home ─────────────────────────────────────────────────────
  { id:"h1",  title:"IKEA KALLAX Shelving Unit – White 4x2",   price:85,  category:"Home",                  sub:"Furniture",           condition:"Good",     location:"Fitzroy, VIC",        seller_username:"VintageHunter",    rating:4.9, time:"5h ago",  image_urls:["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"], is_saved:true,  tags:["Furniture","Good","Minimal"],                              description:"IKEA Kallax 8-cube unit in white. Perfect for vinyl, books, or general storage. Minor scuff on the bottom-right cube (barely visible). Disassembled for easy transport, all hardware included." },
  { id:"h2",  title:"Smeg Retro Kettle – Cream",                price:65,  category:"Home",                  sub:"Kitchen",             condition:"Like New", location:"Collingwood, VIC",    seller_username:"VintageHunter",    rating:4.9, time:"8h ago",  image_urls:["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"], is_saved:false, tags:["Retro","Like New","Collector"],                              description:"Smeg KLF03 retro kettle in cream. Used about 15 times before moving to a different kitchen aesthetic. Heating element is pristine. Comes with original box and instructions." },
  { id:"h3",  title:"Vintage Turkish Kilim Rug – 150x240cm",    price:190, category:"Home",                  sub:"Rugs & Decor",        condition:"Good",     location:"Brunswick, VIC",      seller_username:"VintageHunter",    rating:4.9, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80"], is_saved:false, tags:["Vintage","Furniture","Handmade","Good"],                     description:"Hand-woven Turkish kilim rug in a warm red/orange/navy palette. 150x240cm — ideal for living rooms. Some natural wear along the edges consistent with age. Professionally cleaned 6 months ago." },
  { id:"h4",  title:"Nespresso Vertuo Next + Milk Frother",    price:110, category:"Home",                  sub:"Kitchen",             condition:"Like New", location:"Surry Hills, NSW",    seller_username:"RetroCollector",   rating:4.8, time:"2h ago",  image_urls:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"], is_saved:false, tags:["Like New","Minimal"],                              description:"Nespresso Vertuo Next machine with the Aeroccino3 milk frother. Both work perfectly. Descaled 2 months ago. Comes with welcome capsule kit (still sealed). Reason for selling: upgrading to a proper espresso machine." },
  // ── Sports ───────────────────────────────────────────────────
  { id:"s1",  title:"Trek Marlin 5 Mountain Bike – Medium",    price:580, category:"Sports",                sub:"Bikes",               condition:"Used",     location:"Fremantle, WA",       seller_username:"RetroCollector",   rating:4.8, time:"3h ago",  image_urls:["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"], is_saved:false, tags:["Used","Imported"],                              description:"2021 Trek Marlin 5 in medium frame. 21-speed, hydraulic disc brakes. New tyres fitted 3 months ago. Some trail scratches on the down tube but nothing structural. Rides brilliantly on any surface." },
  { id:"s2",  title:"Rogue Echo Bike – Commercial Grade",      price:650, category:"Sports",                sub:"Gym Equipment",       condition:"Good",     location:"South Melbourne, VIC", seller_username:"VintageHunter",    rating:4.9, time:"12h ago", image_urls:["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"], is_saved:false, tags:["Good","Rare"],                              description:"Rogue Echo Bike — built like a tank. Used daily for 18 months, belt is in excellent condition. Console working correctly. Selling because I'm moving interstate and it won't fit in the van." },
  { id:"s3",  title:"Surfboard – Firewire Seaside 5'7\"",      price:480, category:"Sports",                sub:"Surf & Watersports",  condition:"Good",     location:"Manly, NSW",          seller_username:"RetroCollector",   rating:4.8, time:"1d ago",  image_urls:["https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80"], is_saved:false, tags:["Good","Custom"],                              description:"Firewire Seaside 5'7\" in Thunderbolt construction. Ideal for small-to-medium surf. Two small dings repaired with solar resin — fully watertight. Comes with Futures fin set (3 fins) and leash." },
];

const DEMO_CONVOS = [
  { id:"c1", other_user:"Sarah", other_avatar:"https://i.pravatar.cc/80?img=47", listing_title:"Air Jordan 4", last_message:"Sure, 6pm works!", last_time:"2m", unread:0, online:true,
    messages:[{id:1,from_me:false,content:"Hi! Is this still available?",created_at:"2:30 PM"},{id:2,from_me:true,content:"Yes, it is!",created_at:"2:31 PM"},{id:3,from_me:false,content:"Can I pick up tonight?",created_at:"2:32 PM"},{id:4,from_me:true,content:"Sure, 6pm works!",created_at:"2:33 PM"}]},
  { id:"c2", other_user:"Jake M.", other_avatar:"https://i.pravatar.cc/80?img=12", listing_title:"Sony Camera", last_message:"Is the lens included?", last_time:"15m", unread:2, online:true,
    messages:[{id:1,from_me:false,content:"Is the lens included?",created_at:"1:20 PM"}]},
];

// ═══════════════════════════════════════════════════════
//  DATABASE HELPERS
// ═══════════════════════════════════════════════════════

async function dbGetListings(userId) {
  if (!supabase) return [...DEMO_VINTAGE, ...DEMO_LISTINGS];

  // Step 1: fetch all active listings (requires public SELECT policy on listings table)
  const { data: rawListings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[LoopGen] dbGetListings error:", error.message,
      "\n→ Check Supabase RLS: listings table needs a public SELECT policy.");
    return [];
  }
  if (!rawListings || rawListings.length === 0) return [];

  // Step 2: fetch profiles for all unique seller_ids in one query
  const sellerIds = [...new Set(rawListings.map(l => l.seller_id).filter(Boolean))];
  let profileMap = {};
  if (sellerIds.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", sellerIds);
    if (pErr) console.error("[LoopGen] profiles fetch error:", pErr.message);
    (profiles || []).forEach(p => { profileMap[p.id] = p; });
  }

  // Step 3: fetch saved state for the current user
  let savedSet = new Set();
  if (userId) {
    const { data: saved } = await supabase
      .from("saved_items").select("listing_id").eq("user_id", userId)
      .in("listing_id", rawListings.map(l => l.id));
    (saved || []).forEach(s => savedSet.add(s.listing_id));
  }

  return rawListings.map(l => ({
    ...l,
    seller_username: profileMap[l.seller_id]?.username || null,
    seller_avatar:   profileMap[l.seller_id]?.avatar_url || null,
    is_saved: savedSet.has(l.id),
    image_urls: l.image_urls || [],
    tags: l.tags || [],
    time: timeSince(l.created_at),
  }));
}

async function dbCreateListing(listing, userId) {
  if (!supabase) { return null; }
  const { data, error } = await supabase
    .from("listings")
    .insert({ ...listing, seller_id: userId, status: "active" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbToggleSave(listingId, userId, isSaved) {
  if (!supabase) return;
  if (isSaved) {
    await supabase.from("saved_items").delete()
      .match({ listing_id: listingId, user_id: userId });
  } else {
    await supabase.from("saved_items").insert({ listing_id: listingId, user_id: userId });
  }
}

async function dbGetConversations(userId) {
  if (!supabase) return DEMO_CONVOS;

  // Step 1: fetch conversations — simple query, no FK-dependent nested joins
  // The buyer:buyer_id(...) nested join requires a FK from conversations.buyer_id
  // to auth.users.id which does not exist in the live DB, causing an error
  // that falls back to DEMO_CONVOS. Fetch conversations and profiles separately.
  const { data, error } = await supabase
    .from("conversations")
    .select(`*, messages(body, created_at, sender_id)`)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) { console.error("getConversations:", error); return DEMO_CONVOS; }
  if (!data || data.length === 0) return [];

  // Step 2: collect all participant UUIDs and fetch their profiles in one query
  const participantIds = [
    ...new Set(data.flatMap(c => [c.buyer_id, c.seller_id]).filter(Boolean))
  ];
  let profileMap = {};
  if (participantIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", participantIds);
    (profiles || []).forEach(p => { profileMap[p.id] = p; });
  }

  // Step 3: map to the shape the UI expects
  return data.map(c => {
    const isBuyer   = c.buyer_id === userId;
    const otherId   = isBuyer ? c.seller_id : c.buyer_id;
    const otherProf = profileMap[otherId];
    const lastMsg   = (c.messages || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      ...c,
      convId:        c.id,
      other_user:    otherProf?.username    || (isBuyer ? "Seller" : "Buyer"),
      other_avatar:  otherProf?.avatar_url  || null,
      listing_title: c.listing_title        || "Item",
      last_message:  lastMsg?.body          || "",
      last_sender_id: lastMsg?.sender_id    || null,
      last_time:     lastMsg ? timeSince(lastMsg.created_at) : "",
      unread:        0,
      online:        false,
    };
  });
}

async function dbGetMessages(conversationId) {
  // Always fetch from network — never use cached data for messages
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) { console.error("getMessages:", error); return []; }
  // DB stores message text in 'body' column — map to 'content' for frontend consistency
  return (data || []).map(m => ({ ...m, content: m.body ?? m.content ?? "" }));
}

async function dbSendMessage(conversationId, senderId, content) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("messages")
    // DB column is 'body' — content is the parameter name used internally
    .insert({ conversation_id: conversationId, sender_id: senderId, body: content })
    .select()
    .single();
  if (error) throw error;
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  return data;
}

async function dbGetOrCreateConversation(listingId, buyerId, sellerId) {
  if (!supabase) return null;
  // Check existing by listing + buyer (seller_id not required — may have been null initially)
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (existing) {
    // SELLER VISIBILITY FIX: if seller_id is null or wrong, update it now.
    // A conversation with null seller_id is invisible to the seller under RLS.
    // Filling it in is safe — no data removed, just restores the missing FK.
    if (existing.seller_id !== sellerId && sellerId) {
      const { data: updated, error: uErr } = await supabase
        .from("conversations")
        .update({ seller_id: sellerId })
        .eq("id", existing.id)
        .select()
        .single();
      if (!uErr && updated) return updated;
    }
    return existing;
  }

  // Create new conversation with both buyer and seller IDs
  const { data, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbGetProfile(userId) {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

async function dbUpsertProfile(userId, updates) {
  if (!supabase) return;
  await supabase.from("profiles").upsert({ id: userId, ...updates });
}

// Allowed image MIME types — reject anything else before upload
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg","image/jpg","image/png","image/webp","image/gif"]);

async function dbUploadImage(file, userId) {
  if (!supabase) return null;
  // FIX 10: Validate MIME type server-side (not just accept attribute)
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed. Please upload a JPEG, PNG, WebP, or GIF.`);
  }
  const extMap = { "image/jpeg":"jpg","image/jpg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif" };
  const ext = extMap[file.type] || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("listing-images").upload(path, file, {
    upsert: true,
    contentType: file.type, // Explicitly set content type — don't trust file extension
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
  return publicUrl;
}

async function dbGetUserListings(userId) {
  if (!supabase) return [];
  const { data } = await supabase.from("listings").select("*")
    .eq("seller_id", userId)
    .in("status", ["active","sold"])
    .order("created_at", { ascending: false });
  return data || [];
}

async function dbMarkAsSold(listingId, userId) {
  if (!supabase) return;
  // Defence-in-depth: always scope mutations to the authenticated owner.
  // Supabase RLS is the primary guard; this is a belt-and-suspenders check.
  const { error } = await supabase.from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("seller_id", userId);
  if (error) throw error;
}

async function dbDeleteListing(listingId, userId) {
  if (!supabase) return;
  // Defence-in-depth: always scope mutations to the authenticated owner.
  const { error } = await supabase.from("listings")
    .update({ status: "deleted" })
    .eq("id", listingId)
    .eq("seller_id", userId);
  if (error) throw error;
}

// Update a listing the authenticated user owns
async function dbUpdateListing(listingId, userId, updates) {
  if (!supabase) return null;
  // Note: listings table has no updated_at column — do not include it
  const { data, error } = await supabase.from("listings")
    .update({ ...updates })
    .eq("id", listingId)
    .eq("seller_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbGetSavedListings(userId) {
  if (!supabase) return DEMO_LISTINGS.filter(l => l.is_saved);
  const { data } = await supabase
    .from("saved_items")
    .select("listings(*, profiles(username, avatar_url))")
    .eq("user_id", userId);
  return (data || [])
    .map(s => s.listings)
    .filter(Boolean)
    .map(l => ({
      ...l,
      seller_username: l.profiles?.username || "user",
      seller_avatar:   l.profiles?.avatar_url,
      tags: l.tags || [],
      is_saved: true,
      time: timeSince(l.created_at),
    }));
}

// Stub — real impl calls Supabase Edge Function "loopgen-ai-desc"
async function dbAiDescription(title, category, condition) {
  if (!supabase) return null;
  const { data, error } = await supabase.functions.invoke("loopgen-ai-desc", {
    body: { title, category, condition }
  });
  if (error) throw error;
  return data?.description || null;
}

// Save offer — throws on error so caller can show user-facing message
async function dbSaveOffer({ listing_id, buyer_id, seller_id, price }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("offers")
    .insert({ listing_id, buyer_id, seller_id, price: parseFloat(price), created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Fetch pending offers for a seller — used for notification badge and offers list
async function dbGetPendingOffers(sellerId) {
  if (!supabase) return [];
  // Use simple select — FK-dependent nested joins (buyer:buyer_id, listing:listing_id)
  // fail if those FKs don't exist in the live DB, returning [] silently.
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) { console.error("dbGetPendingOffers:", error); return []; }
  if (!data || data.length === 0) return [];

  // Fetch listing titles and buyer usernames separately
  const listingIds = [...new Set(data.map(o => o.listing_id).filter(Boolean))];
  const buyerIds   = [...new Set(data.map(o => o.buyer_id).filter(Boolean))];
  let listingMap = {}, profileMap = {};

  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings").select("id, title, image_urls").in("id", listingIds);
    (listings || []).forEach(l => { listingMap[l.id] = l; });
  }
  if (buyerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles").select("id, username").in("id", buyerIds);
    (profiles || []).forEach(p => { profileMap[p.id] = p; });
  }

  return data.map(o => ({
    ...o,
    listing_title:  listingMap[o.listing_id]?.title           || "Item",
    listing_image:  listingMap[o.listing_id]?.image_urls?.[0] || null,
    buyer_username: profileMap[o.buyer_id]?.username          || "Buyer",
  }));
}

// Save report — uses 'reporter_id' to match the live DB column name
async function dbSaveReport({ listing_id, reporter_id, reason }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reports")
    .insert({ listing_id, reporter_id, reason, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

function timeSince(dateStr) {
  if (!dateStr) return "";
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
  return `${Math.floor(secs/86400)}d ago`;
}

// ═══════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════
const IcoSearch  = ({c="#374151"}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7.5" stroke={c} strokeWidth="2" fill="none"/><path d="M11 7.5a3.5 3.5 0 0 0-3.5 3.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/><path d="M17.5 17.5L21 21" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></svg>;
const IcoUser    = ({c="#374151"}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7.5" r="3.5" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.12"/><path d="M4.5 20.5c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>;
const IcoBack    = ({light}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={light?"rgba(255,255,255,0.15)":"#f3f4f6"}/><path d="M14 8l-4 4 4 4" stroke={light?"white":"#111"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoSend    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.25"/></svg>;
const IcoCamera  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const IcoHome    = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="nhg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs>{a?<><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" fill="url(#nhg)" fillOpacity="0.18"/><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="url(#nhg)" strokeWidth="2" strokeLinejoin="round"/><rect x="9" y="13" width="6" height="10" rx="1.5" fill="url(#nhg)" fillOpacity="0.4" stroke="url(#nhg)" strokeWidth="1.5"/></>:<><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="#c4c9d4" strokeWidth="2" strokeLinejoin="round"/><rect x="9" y="13" width="6" height="10" rx="1.5" stroke="#c4c9d4" strokeWidth="1.5"/></>}</svg>;
const IcoExplore = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="neg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs><circle cx="11" cy="11" r="8" stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="2" fill={a?"url(#neg)":""} fillOpacity={a?"0.12":"0"}/><path d="M11 7a1 1 0 00-1 1" stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/><path d="M7.5 14.5l3-5 5-3-3 5-5 3z" fill={a?"url(#neg)":"#c4c9d4"} stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="1" strokeLinejoin="round"/><path d="M17.5 17.5L21 21" stroke={a?"url(#neg)":"#c4c9d4"} strokeWidth="2.2" strokeLinecap="round"/></svg>;
const IcoChats   = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="ncg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs><path d="M21 14.5a2 2 0 01-2 2H7.5l-4 4V5a2 2 0 012-2h13a2 2 0 012 2v9.5z" fill={a?"url(#ncg)":"none"} fillOpacity={a?"0.15":"0"} stroke={a?"url(#ncg)":"#c4c9d4"} strokeWidth="2" strokeLinejoin="round"/>{a&&<><line x1="8" y1="9" x2="16" y2="9" stroke="url(#ncg)" strokeWidth="1.6" strokeLinecap="round"/><line x1="8" y1="12.5" x2="13" y2="12.5" stroke="url(#ncg)" strokeWidth="1.6" strokeLinecap="round"/></>}</svg>;
const IcoProfile = ({a}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="npg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#1c7c45"/></linearGradient></defs><circle cx="12" cy="8" r="3.5" stroke={a?"url(#npg)":"#c4c9d4"} strokeWidth="2" fill={a?"url(#npg)":""} fillOpacity={a?"0.18":"0"}/><path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={a?"url(#npg)":"#c4c9d4"} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>;

// ═══════════════════════════════════════════════════════
//  CATEGORY ICONS
// ═══════════════════════════════════════════════════════
const CatFashionIcon     = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><path d="M14 18L8 26h8v14h24V26h8l-6-8" fill="#ec4899" fillOpacity="0.18" stroke="#ec4899" strokeWidth="2" strokeLinejoin="round"/><path d="M20 14c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" fill="none"/><path d="M20 14L14 18M36 14l6 4" stroke="#f472b6" strokeWidth="2.2" strokeLinecap="round"/></svg>;
const CatElectronicsIcon = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><rect x="12" y="18" width="32" height="14" rx="2.5" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="2"/><rect x="15" y="21" width="26" height="8" rx="1.5" fill="#60a5fa" opacity="0.5"/><rect x="10" y="32" width="36" height="3" rx="1.5" fill="#3b82f6" opacity="0.3"/><circle cx="28" cy="35" r="1.5" fill="#3b82f6"/></svg>;
const CatHomeIcon        = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><path d="M10 26L28 12l18 14" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><rect x="16" y="26" width="24" height="16" rx="1" fill="#fbbf24" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="2"/><rect x="24" y="32" width="8" height="10" rx="1.5" fill="#fbbf24" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="1.5"/></svg>;
const CatSportsIcon      = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><circle cx="28" cy="28" r="14" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2.2"/><path d="M28 22l4 3-1.5 4.5h-5L24 25z" fill="#34d399" stroke="#10b981" strokeWidth="1" fillOpacity="0.8"/><circle cx="22" cy="22" r="3" fill="white" opacity="0.25"/></svg>;
const CatVehiclesIcon    = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><path d="M12 28h32l-4-10H16z" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round"/><rect x="10" y="28" width="36" height="9" rx="2" fill="#8b5cf6" fillOpacity="0.15" stroke="#8b5cf6" strokeWidth="2"/><circle cx="19" cy="38" r="4" stroke="#8b5cf6" strokeWidth="2" fill="none"/><circle cx="37" cy="38" r="4" stroke="#8b5cf6" strokeWidth="2" fill="none"/></svg>;
const CatAllIcon         = () => <svg viewBox="0 0 56 56" fill="none" width="34" height="34"><rect x="12" y="12" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.25" stroke={GREEN} strokeWidth="2"/><rect x="30" y="12" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.15" stroke={GREEN} strokeWidth="2"/><rect x="12" y="30" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.15" stroke={GREEN} strokeWidth="2"/><rect x="30" y="30" width="14" height="14" rx="3" fill={GREEN} fillOpacity="0.25" stroke={GREEN} strokeWidth="2"/></svg>;

const CatVintageIcon = () => (
  <svg viewBox="0 0 56 56" fill="none" width="34" height="34">
    {/* Vinyl record */}
    <circle cx="28" cy="28" r="16" fill="#7c3aed" fillOpacity="0.18" stroke="#7c3aed" strokeWidth="2"/>
    <circle cx="28" cy="28" r="10" fill="#a78bfa" fillOpacity="0.25" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="28" cy="28" r="4" fill="#7c3aed" fillOpacity="0.7" stroke="#7c3aed" strokeWidth="1.5"/>
    <circle cx="28" cy="28" r="1.5" fill="white"/>
    {/* Cassette spool hint */}
    <path d="M22 14 Q24 11 28 11 Q32 11 34 14" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const CAT_ICONS = { All: CatAllIcon, Fashion: CatFashionIcon, Electronics: CatElectronicsIcon, Home: CatHomeIcon, Sports: CatSportsIcon, Vehicles: CatVehiclesIcon, "Vintage & Collectibles": CatVintageIcon };

// ═══════════════════════════════════════════════════════
//  LAYOUT PRIMITIVES
// ═══════════════════════════════════════════════════════
function Phone({ children }) {
  return (
    <div className="lg-app-root" style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:"white",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px;}
        input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif;}
        body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
        button{-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
        input:focus,textarea:focus,select:focus{outline:none;border-color:#1c7c45 !important;box-shadow:0 0 0 3px rgba(28,124,69,0.12);}
        @keyframes loopgen-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes loopgen-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .lg-screen-enter{animation:loopgen-fadein 0.2s ease forwards;}
        /* Disable non-essential motion for users who prefer reduced motion —
           target only specific UI transitions, NOT all animations globally */
        @media (prefers-reduced-motion: reduce) {
          .lg-screen-enter { animation: none !important; }
        }
        html,body,#root{height:100%;width:100%;margin:0;padding:0;}

        /* ── Mobile (default): full-width single column ── */
        .lg-layout { display:flex; flex-direction:column; width:100%; min-height:100vh; background:white; }
        .lg-sidebar { display:none; }
        .lg-content { flex:1; display:flex; flex-direction:column; position:relative; width:100%; }
        .lg-bottom-nav { display:flex; }
        .lg-content-scroll { padding-bottom: 88px; }

        /* ── Tablet / Desktop (>= 768px): sidebar + content ── */
        @media (min-width: 768px) {
          .lg-app-root { background:#f3f4f6; }
          .lg-layout {
            flex-direction:row;
            max-width:1100px;
            margin:0 auto;
            min-height:100vh;
            background:white;
            box-shadow:0 0 40px rgba(0,0,0,0.08);
          }
          .lg-sidebar {
            display:flex;
            flex-direction:column;
            width:220px;
            min-width:220px;
            background:white;
            border-right:1px solid #f0f1f3;
            padding:24px 0;
            position:sticky;
            top:0;
            height:100vh;
            overflow-y:auto;
            flex-shrink:0;
          }
          .lg-content {
            flex:1;
            min-width:0;
            height:100vh;
            overflow-y:auto;
          }
          .lg-bottom-nav { display:none !important; }
          .lg-content-scroll { padding-bottom: 24px !important; }
          .lg-no-bottom-pad { padding-bottom:24px !important; }
        }

        /* ── Large desktop (>= 1200px): wider layout ── */
        @media (min-width: 1200px) {
          .lg-layout { max-width:1280px; }
          .lg-sidebar { width:260px; min-width:260px; }
        }

        /* ── Desktop: fix category grid tiles — prevent extreme tall aspect ratio ── */
        @media (min-width: 768px) {
          .lg-cat-tile { aspect-ratio: unset !important; height: 140px !important; }
          .lg-cat-tile-more { aspect-ratio: unset !important; height: 140px !important; }
          /* Smooth hover lift on desktop category tiles — transform only, no layout shift */
          .lg-cat-tile, .lg-cat-tile-more {
            transition: transform 0.18s ease, box-shadow 0.18s ease;
            will-change: transform;
          }
          .lg-cat-tile:hover, .lg-cat-tile-more:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 12px 32px rgba(0,0,0,0.38) !important;
          }
          /* Explore / Search screen: fill the content column correctly */
          .lg-explore-root { display:flex; flex-direction:column; flex:1; min-height:0; height:100%; overflow:hidden; }
          .lg-explore-scroll { flex:1; overflow-y:auto; min-height:0; padding-bottom:24px !important; }
          /* Chats screen: fill content column */
          .lg-chats-root { display:flex; flex-direction:column; flex:1; min-height:0; height:100%; overflow:hidden; }
          .lg-chats-scroll { flex:1; overflow-y:auto; min-height:0; padding-bottom:24px !important; }
          /* On desktop: convert horizontal card scroll rows into a 2-row wrap grid
             This completely eliminates last-card clipping — no overflow-x needed */
          .lg-hscroll {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            overflow-x: unset !important;
            padding-right: 16px !important;
            gap: 12px !important;
          }
          /* Remove the spacer divs from the grid flow */
          .lg-hscroll > [aria-hidden="true"] { display: none !important; }
          /* Compact cards inside grid must not have fixed width */
          .lg-hscroll > * { width: auto !important; flex-shrink: unset !important; }
          /* Sell screen: pin header and content to top-left, never center */
          .lg-sell-root { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; align-items:stretch; justify-content:flex-start; }
          .lg-sell-header { align-self:flex-start; width:100%; }
          .lg-sell-scroll { flex:1; overflow-y:auto; min-height:0; padding-bottom:24px !important; align-self:stretch; }
          /* Home scroll container */
          .lg-main-scroll { overflow-x:hidden; }
        }
      `}</style>
      <div className="lg-layout">
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  // Removed — fake status bar (9:41 / signal / battery) not shown in production
  return null;
}

function BottomNav({ active, onNav, msgCount = 0, offerCount = 0 }) {
  const tabs = [
    {id:"home",    label:"Home",     icon: a => <IcoHome a={a}/>},
    {id:"explore", label:"Search",   icon: a => <IcoExplore a={a}/>},
    {id:"sell",    label:"Sell",     icon: null},
    {id:"chats",   label:"Messages", icon: a => <IcoChats a={a}/>, badge: msgCount + offerCount},
    {id:"profile", label:"Profile",  icon: a => <IcoProfile a={a}/>},
  ];
  const Badge = ({ count }) => count > 0 ? (
    <div style={{
      position:"absolute", top:0, right:0,
      background:"#ef4444", color:"white",
      borderRadius:"50%", minWidth:16, height:16,
      fontSize:10, fontWeight:700,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"0 3px", lineHeight:1,
      border:"1.5px solid white", zIndex:1,
    }}>{count > 9 ? "9+" : count}</div>
  ) : null;
  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <div className="lg-sidebar">
        {/* Logo */}
        <div style={{padding:"0 20px 28px",borderBottom:"1px solid #f0f1f3",marginBottom:12}}>
          <LoopGenLogo height={28}/>
        </div>
        {/* Nav items */}
        <div style={{flex:1,padding:"4px 12px"}}>
          {tabs.map(t => (
            <div key={t.id} onClick={() => onNav(t.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:14,
                cursor:"pointer",marginBottom:2,
                background:active===t.id?"rgba(28,124,69,0.09)":"transparent",
                transition:"background 0.15s"}}>
              {t.id==="sell"
                ? <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                : <div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,background:active===t.id?"rgba(28,124,69,0.12)":"#f3f4f6",flexShrink:0,position:"relative"}}>
                    {t.icon(active===t.id)}
                    <Badge count={t.badge||0}/>
                  </div>
              }
              <span style={{fontSize:14,fontWeight:active===t.id?700:500,
                color:active===t.id?GREEN:"#374151",letterSpacing:0.1}}>
                {t.label}
                {t.badge > 0 && <span style={{marginLeft:6,background:"#ef4444",color:"white",borderRadius:50,fontSize:10,fontWeight:700,padding:"1px 6px"}}>{t.badge > 9 ? "9+" : t.badge}</span>}
              </span>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"16px 20px",borderTop:"1px solid #f0f1f3",marginTop:"auto"}}>
          <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.6}}>
            <a href="https://www.loopgen.com.au/terms" style={{color:"#9ca3af",textDecoration:"none",display:"block",marginBottom:2}}>Terms</a>
            <a href="https://www.loopgen.com.au/privacy" style={{color:"#9ca3af",textDecoration:"none",display:"block",marginBottom:2}}>Privacy</a>
            <a href="mailto:support@loopgen.com.au" style={{color:"#9ca3af",textDecoration:"none",display:"block"}}>Contact</a>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav (hidden on desktop via CSS) ── */}
      <div className="lg-bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f0f1f3",justifyContent:"space-around",alignItems:"center",padding:"10px 4px 24px",zIndex:20,boxShadow:"0 -4px 24px rgba(0,0,0,0.07)"}}>
        {tabs.map(t => (
          <div key={t.id} onClick={() => onNav(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",minWidth:52,position:"relative"}}>
            {t.id==="sell"
              ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,marginTop:-4}}>
                  <div style={{width:58,height:58,borderRadius:18,background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-20,boxShadow:`0 8px 24px rgba(28,124,69,0.38)`,border:"3px solid white"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:GREEN,letterSpacing:0.1}}>Sell</span>
                </div>
              : <><div style={{width:44,height:34,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,background:active===t.id?"rgba(28,124,69,0.09)":"transparent",transition:"background 0.2s",position:"relative"}}>
                    {t.icon(active===t.id)}
                    <Badge count={t.badge||0}/>
                  </div>
                  <span style={{fontSize:10,fontWeight:active===t.id?700:500,color:active===t.id?GREEN:"#b0b7c3",letterSpacing:0.1}}>{t.label}</span>
                </>
            }
          </div>
        ))}
      </div>
    </>
  );
}

function GreenBtn({ children, onClick, mt=16, disabled=false, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{width:"100%",marginTop:mt,padding:"16px",borderRadius:18,background:disabled?"#d1fae5":GREEN,border:"none",color:"white",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",boxShadow:disabled?"none":`0 6px 22px ${GREEN}44`,letterSpacing:0.2,...style}}>
      {children}
    </button>
  );
}

function FInp({ placeholder, value="", onChange=()=>{}, type="text", readOnly=false }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} readOnly={readOnly}
    style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px",fontSize:14,outline:"none",marginBottom:12,color:"#374151",background:readOnly?"#f9fafb":"white"}}/>;
}

function FSel({ ph, value, onChange, opts }) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px",fontSize:14,outline:"none",marginBottom:12,color:value?"#374151":"#9ca3af",background:"white",appearance:"none"}}>
    {opts.map(o => <option key={o} value={o} style={{color:"#374151"}}>{o||ph}</option>)}
  </select>;
}

// ═══════════════════════════════════════════════════════
//  TOAST COMPONENT
// ═══════════════════════════════════════════════════════
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{position:"absolute",bottom:100,left:20,right:20,background:"#111",color:"white",padding:"12px 18px",borderRadius:16,fontSize:13,fontWeight:600,textAlign:"center",zIndex:100,boxShadow:"0 8px 28px rgba(0,0,0,0.28)",animation:"fadeIn 0.2s ease"}}>
      {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  CONFIRM MODAL
// ═══════════════════════════════════════════════════════
function ConfirmModal({ confirm, onCancel }) {
  if (!confirm) return null;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",width:"100%",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:15,fontWeight:600,color:"#111",marginBottom:20,textAlign:"center",lineHeight:1.5}}>{confirm.msg}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,fontSize:14,cursor:"pointer",color:"#374151"}}>Cancel</button>
          <button onClick={confirm.onConfirm} style={{flex:1,padding:"14px",borderRadius:14,border:"none",background:"#ef4444",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── P1: Offer Modal ───────────────────────────────────────────────────────────
function OfferModal({ modal, offerPrice, setOfferPrice, onSubmit, onClose, submitting = false }) {
  if (!modal) return null;
  const item = modal.item;
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",width:"100%",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111",marginBottom:4}}>Make an Offer</div>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:20}}>
          Listed at <strong style={{color:"#111"}}>${item.price}</strong> · {item.title}
        </div>
        <div style={{display:"flex",alignItems:"center",background:"#f9fafb",borderRadius:14,border:"1.5px solid #e5e7eb",padding:"12px 16px",marginBottom:16,gap:8}}>
          <span style={{fontSize:18,fontWeight:700,color:"#111"}}>$</span>
          <input
            type="number"
            placeholder="Your offer amount"
            value={offerPrice}
            onChange={e => setOfferPrice(e.target.value)}
            disabled={submitting}
            style={{flex:1,border:"none",background:"transparent",fontSize:18,fontWeight:700,color:"#111",outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}
            autoFocus
          />
        </div>
        <div style={{fontSize:11,color:"#9ca3af",marginBottom:20,lineHeight:1.5}}>
          Your offer will be sent to the seller. They can accept, decline, or counter.
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} disabled={submitting}
            style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,fontSize:14,cursor:submitting?"default":"pointer",color:"#374151",opacity:submitting?0.5:1}}>
            Cancel
          </button>
          <button
            disabled={submitting || !offerPrice || isNaN(parseFloat(offerPrice)) || parseFloat(offerPrice) <= 0}
            onClick={onSubmit}
            style={{flex:2,padding:"14px",borderRadius:14,border:"none",
              background:GREEN,color:"white",fontWeight:700,fontSize:14,
              cursor: (submitting || !offerPrice || parseFloat(offerPrice) <= 0) ? "default" : "pointer",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              opacity: (submitting || !offerPrice || parseFloat(offerPrice) <= 0) ? 0.55 : 1}}>
            {submitting ? "Sending…" : "Send Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── P1: Report Modal ──────────────────────────────────────────────────────────
function ReportModal({ modal, onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  if (!modal) return null;
  const reasons = ["Misleading description","Wrong category","Suspected fake item","Prohibited item","Spam / duplicate","Other"];
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",width:"100%",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#111",marginBottom:4}}>Report Listing</div>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:16}}>What's the issue with this listing?</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {reasons.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{padding:"11px 14px",borderRadius:12,textAlign:"left",cursor:"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:600,
                border:`1.5px solid ${reason===r ? GREEN : "#e5e7eb"}`,
                background: reason===r ? "#f0fdf4" : "white",
                color: reason===r ? GREEN : "#374151"}}>
              {r}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,fontSize:14,cursor:"pointer",color:"#374151"}}>
            Cancel
          </button>
          <button onClick={() => { if (!reason) return; onSubmit(reason); }}
            style={{flex:2,padding:"14px",borderRadius:14,border:"none",
              background:"#ef4444",color:"white",fontWeight:700,fontSize:14,
              cursor: reason ? "pointer" : "default",fontFamily:"'Plus Jakarta Sans',sans-serif",
              opacity: reason ? 1 : 0.45}}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Tag colour palette
// ── Tag Taxonomy ──────────────────────────────────────────────────────────────
// All predefined tags grouped by type. System tags not exposed in UI.
const TAG_TAXONOMY = {
  style:     ["Vintage","Retro","Antique","Collector","Rare","Limited Edition"],
  type:      ["Camera","Vinyl","Sneakers","Furniture","Watch","Gaming","Electronics","Fashion"],
  condition: ["New","Like New","Good","Used","Needs Repair"],
  era:       ["90s","Y2K","80s","Minimal","Streetwear","Analog","Film","Handmade","Imported","Custom"],
  // system: ["Trending","Hot","New Listing","Price Drop"] — not exposed in UI
};
const ALL_USER_TAGS = [
  ...TAG_TAXONOMY.style,
  ...TAG_TAXONOMY.type,
  ...TAG_TAXONOMY.condition,
  ...TAG_TAXONOMY.era,
];
const MAX_TAGS = 5;

// ── Auto-tag assist — deterministic, no AI ────────────────────────────────────
function autoTagAssist(title = "", category = "", condition = "") {
  const t = title.toLowerCase();
  const cat = category.toLowerCase();
  const suggested = new Set();

  // Type detection from title
  if (/polaroid|canon ae|olympus|pentax|film|35mm|slr|rangefinder|leica/.test(t)) {
    suggested.add("Camera"); suggested.add("Film");
  }
  if (/vinyl|lp\b|record|album|pressing/.test(t)) suggested.add("Vinyl");
  if (/nike|jordan|adidas|new balance|converse|vans|reebok|puma|sneaker|trainer|dunk/.test(t)) suggested.add("Sneakers");
  if (/watch|rolex|seiko|omega|casio|citizen/.test(t)) suggested.add("Watch");
  if (/game|gameboy|playstation|nintendo|xbox|sega|atari|cartridge/.test(t)) suggested.add("Gaming");
  if (/sofa|couch|chair|table|desk|shelf|wardrobe|furniture/.test(t)) suggested.add("Furniture");

  // Style/era detection from title
  if (/vintage|antique|retro|classic/.test(t)) suggested.add("Vintage");
  if (/retro/.test(t)) suggested.add("Retro");
  if (/90s|nineties/.test(t)) suggested.add("90s");
  if (/y2k|2000s/.test(t)) suggested.add("Y2K");
  if (/80s|eighties/.test(t)) suggested.add("80s");
  if (/streetwear|supreme|palace|bape|off.white/.test(t)) suggested.add("Streetwear");
  if (/collector|rare|limited edition|limited ed/.test(t)) suggested.add("Collector");
  if (/rare\b/.test(t)) suggested.add("Rare");
  if (/limited/.test(t)) suggested.add("Limited Edition");
  if (/handmade|hand made|hand-made/.test(t)) suggested.add("Handmade");
  if (/imported|import/.test(t)) suggested.add("Imported");
  if (/custom|bespoke/.test(t)) suggested.add("Custom");
  if (/minimal|minimalist/.test(t)) suggested.add("Minimal");
  if (/analog|analogue/.test(t)) suggested.add("Analog");

  // Category → type tag
  if (cat.includes("vintage")) { suggested.add("Vintage"); }
  if (cat.includes("fashion")) suggested.add("Fashion");
  if (cat.includes("electronics")) suggested.add("Electronics");
  if (cat.includes("sports")) suggested.add("Gaming"); // keep for gaming items in sports

  // Condition → condition tag
  const condMap = {
    "New": "New", "Like New": "Like New", "Good": "Good",
    "Used": "Used", "For Parts": "Needs Repair",
  };
  if (condMap[condition]) suggested.add(condMap[condition]);

  return [...suggested].slice(0, MAX_TAGS);
}

const TAG_COLORS = {
  // Style / Collector
  "Vintage":         { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  "Retro":           { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
  "Antique":         { bg:"#fef3c7", text:"#92400e", border:"#fde68a" },
  "Collector":       { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Rare":            { bg:"#fff1f2", text:"#9f1239", border:"#fecdd3" },
  "Limited Edition": { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  // Type
  "Camera":          { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Vinyl":           { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  "Sneakers":        { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
  "Furniture":       { bg:"#f9fafb", text:"#374151", border:"#d1d5db" },
  "Watch":           { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Gaming":          { bg:"#eef2ff", text:"#3730a3", border:"#c7d2fe" },
  "Electronics":     { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Fashion":         { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  // Condition
  "New":             { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Like New":        { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Good":            { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Used":            { bg:"#f9fafb", text:"#374151", border:"#d1d5db" },
  "Needs Repair":    { bg:"#fef2f2", text:"#991b1b", border:"#fecaca" },
  // Era / Context
  "90s":             { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  "Y2K":             { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "80s":             { bg:"#fff1f2", text:"#9f1239", border:"#fecdd3" },
  "Minimal":         { bg:"#f9fafb", text:"#374151", border:"#d1d5db" },
  "Streetwear":      { bg:"#fdf2f8", text:"#9d174d", border:"#fbcfe8" },
  "Analog":          { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Film":            { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Handmade":        { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  "Imported":        { bg:"#eff6ff", text:"#1e40af", border:"#bfdbfe" },
  "Custom":          { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe" },
  // Legacy / category display
  "For Parts":       { bg:"#fef2f2", text:"#991b1b", border:"#fecaca" },
  "Cameras":         { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0" },
  "Kitchen":         { bg:"#fefce8", text:"#854d0e", border:"#fde68a" },
  "Sports":          { bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  "Books":           { bg:"#fff7ed", text:"#9a3412", border:"#fed7aa" },
};

function VintageTag({ label }) {
  const c = TAG_COLORS[label] || { bg:"#f3f4f6", text:"#374151", border:"#e5e7eb" };
  return (
    <span style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",
      borderRadius:50,fontSize:11,fontWeight:700,letterSpacing:0.1,
      background:c.bg,color:c.text,border:`1.5px solid ${c.border}`,flexShrink:0}}>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════
//  LISTING CARD
// ═══════════════════════════════════════════════════════
function ListingCard({ item, onTap, onSave, compact=false }) {
  const img = item.image_urls?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";
  const isVintage = item.category === "Vintage & Collectibles";

  if (compact) {
    return (
      <div onClick={() => onTap(item)} style={{background:"white",borderRadius:22,overflow:"hidden",
        boxShadow:"0 4px 18px rgba(0,0,0,0.10)",cursor:"pointer",flexShrink:0,width:168}}>
        <div style={{position:"relative"}}>
          <img src={img} alt={item.title} style={{width:"100%",height:160,objectFit:"cover"}}
            onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
          {/* Save */}
          <div onClick={e => onSave(item.id, e)} style={{position:"absolute",top:10,right:10,
            width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.92)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
            cursor:"pointer",backdropFilter:"blur(6px)",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
            {item.is_saved ? "❤️" : "🤍"}
          </div>
          {/* Category badge */}
          {isVintage && (
            <div style={{position:"absolute",bottom:10,left:10,
              background:"rgba(109,40,217,0.88)",color:"white",
              fontSize:10,fontWeight:800,padding:"4px 10px",
              borderRadius:50,backdropFilter:"blur(6px)",letterSpacing:"0.04em"}}>
              ✦ VINTAGE
            </div>
          )}
        </div>
        <div style={{padding:"11px 12px 13px"}}>
          <div style={{fontWeight:900,fontSize:17,color:"#111",letterSpacing:"-0.3px"}}>${item.price}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",marginTop:3,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:3,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {item.location}</div>
          {item.tags?.length > 0 && (
            <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
              {item.tags.slice(0,2).map(t => <VintageTag key={t} label={t}/>)}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div onClick={() => onTap(item)} style={{background:"white",borderRadius:22,overflow:"hidden",
      boxShadow:"0 3px 14px rgba(0,0,0,0.08)",cursor:"pointer",display:"flex",
      flexDirection:"row",alignItems:"stretch",width:"100%",gap:0}}>
      <div style={{position:"relative",flexShrink:0,width:120,minWidth:120,height:115}}>
        <img src={img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
        {item.condition==="New"&&<div style={{position:"absolute",top:7,left:7,background:GREEN,color:"white",fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:8}}>NEW</div>}
        {isVintage&&<div style={{position:"absolute",bottom:7,left:7,background:"rgba(109,40,217,0.88)",color:"white",fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:50,backdropFilter:"blur(4px)"}}>✦ VINTAGE</div>}
      </div>
      <div style={{padding:"13px 14px",flex:1,minWidth:0,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{fontWeight:900,fontSize:18,color:"#111",letterSpacing:"-0.3px"}}>${item.price}</div>
            <div onClick={e => onSave(item.id, e)} style={{fontSize:18,cursor:"pointer",flexShrink:0}}>{item.is_saved?"❤️":"🤍"}</div>
          </div>
          <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:2}}>{item.condition} · {item.category}</div>
          {item.tags?.length > 0 && (
            <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
              {item.tags.slice(0,3).map(t => <VintageTag key={t} label={t}/>)}
            </div>
          )}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <div style={{fontSize:11,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>📍 {item.location}</div>
          <div style={{fontSize:10,color:"#bbb",flexShrink:0,marginLeft:4}}>🕐 {item.time}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SKELETON CARD — shown while listings are loading
// ═══════════════════════════════════════════════════════
function SkeletonCard({ compact=false }) {
  const shine = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "loopgen-shimmer 1.4s ease-in-out infinite",
  };
  if (compact) {
    return (
      <div style={{background:"white",borderRadius:22,overflow:"hidden",flexShrink:0,width:162,boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
        <div style={{...shine,height:148}}/>
        <div style={{padding:"10px 11px 14px",display:"flex",flexDirection:"column",gap:7}}>
          <div style={{...shine,height:14,borderRadius:6,width:"50%"}}/>
          <div style={{...shine,height:12,borderRadius:6,width:"80%"}}/>
          <div style={{...shine,height:10,borderRadius:6,width:"60%"}}/>
        </div>
      </div>
    );
  }
  return (
    <div style={{background:"white",borderRadius:22,overflow:"hidden",boxShadow:"0 3px 14px rgba(0,0,0,0.06)",display:"flex",flexDirection:"row",alignItems:"stretch",width:"100%",gap:0}}>
      <div style={{...shine,flexShrink:0,width:120,minWidth:120,height:115}}/>
      <div style={{padding:"13px 14px",flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{...shine,height:16,borderRadius:6,width:"35%"}}/>
        <div style={{...shine,height:13,borderRadius:6,width:"75%"}}/>
        <div style={{...shine,height:11,borderRadius:6,width:"55%"}}/>
        <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between"}}>
          <div style={{...shine,height:10,borderRadius:6,width:"40%"}}/>
          <div style={{...shine,height:10,borderRadius:6,width:"20%"}}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  DEMO MODE BANNER
// ═══════════════════════════════════════════════════════
function DemoBanner() {
  if (HAS_SUPABASE) return null;
  return (
    <div style={{background:`linear-gradient(90deg,#0d5c33,#1c7c45)`,padding:"7px 16px",fontSize:11,fontWeight:700,color:"white",textAlign:"center",flexShrink:0,letterSpacing:0.2,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      <span>✨</span>
      <span>LoopGen Beta — Exploring demo mode · Real listings coming soon</span>
    </div>
  );
}

// ── Horizontal scrolling category ticker (home screen) ───────────────────────
function HomeTicker() {
  const words = [
    "Cameras","Vinyl","Sneakers","Gaming","Fashion",
    "Kitchen","Furniture","Tech","Books","Jewellery",
    "Collectibles","Sports","Tools","Vintage","Toys",
  ];
  const doubled = [...words, ...words];
  return (
    <div style={{
      overflow:"hidden",
      borderTop:"1px solid #e9e3db",
      borderBottom:"1px solid #e9e3db",
      background:"#ffffff",
      padding:"9px 0",
      flexShrink:0,
    }}>
      <style>{`
        @keyframes home-ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .home-ticker-inner { animation: home-ticker 36s linear infinite; will-change: transform; }
        @media (min-width: 768px) { .home-ticker-inner { animation-duration: 40s; } }
      `}</style>
      <div className="home-ticker-inner" style={{
        display:"flex",
        width:"max-content",
      }}>
        {doubled.map((w, i) => (
          <span key={i} style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"0 16px", fontSize:10, fontWeight:600,
            color:"#908880", textTransform:"uppercase", letterSpacing:"0.10em",
            whiteSpace:"nowrap",
          }}>
            <span style={{
              width:4, height:4, borderRadius:"50%",
              background:"#21a054", display:"inline-block", flexShrink:0,
            }} />
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  CHAT SCREEN — controlled: messages live in parent store
//  props: sellerName, listingTitle, messages[], onSend(msg), onBack
// ═══════════════════════════════════════════════════════
function ChatScreen({ sellerName, listingTitle, messages, onSend, onBack }) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false); // FIX 11: concurrent send protection
  const MAX_MSG_LENGTH = 2000; // FIX 12: message length limit
  // viewH tracks the visual viewport height so the chat shrinks correctly
  // when the mobile keyboard opens — works on iOS Safari, Chrome Android, all browsers
  const [viewH, setViewH] = useState(
    () => window.visualViewport?.height || window.innerHeight
  );
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Visual Viewport API: fires when keyboard opens/closes or browser chrome resizes
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return; // desktop fallback — 100dvh handles it
    const onResize = () => {
      setViewH(vv.height);
      // Scroll to bottom after keyboard animation settles
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return; // FIX 11: block while sending
    // FIX 12: enforce length limit
    if (trimmed.length > MAX_MSG_LENGTH) {
      return; // button is already disabled — safety check
    }
    setIsSending(true);
    onSend({
      id: `msg_${Date.now()}`,
      from_me: true,
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setText("");
    // Re-enable after a short guard period to prevent double-tap on slow devices
    setTimeout(() => {
      setIsSending(false);
      inputRef.current?.focus();
    }, 300);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const initial = (sellerName || "S")[0].toUpperCase();
  const charsLeft = MAX_MSG_LENGTH - text.length;
  const nearLimit = charsLeft < 200;

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "white",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999,
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; -webkit-font-smoothing: antialiased; }
        .lg-chat-input {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px !important;
          -webkit-user-select: text !important;
          user-select: text !important;
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
          border: none;
          outline: none;
        }
        .lg-chat-input:focus { outline: none; border: none; }
        .lg-send-btn { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .lg-messages { flex: 1; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px 12px",
        paddingTop: "max(env(safe-area-inset-top, 14px), 14px)",
        borderBottom: "1px solid #f0f1f3",
        background: "white", flexShrink: 0,
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <div
          onClick={onBack}
          style={{ cursor: "pointer", padding: "6px 10px 6px 2px", WebkitTapHighlightColor: "transparent" }}
        >
          <IcoBack />
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: "linear-gradient(135deg,#1c7c45,#22c55e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 800, fontSize: 17, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 15, color: "#111",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {sellerName || "Seller"}
          </div>
          {listingTitle && (
            <div style={{
              fontSize: 11, color: "#9ca3af",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              Re: {listingTitle}
            </div>
          )}
        </div>
      </div>

      {/* ── Message list ── */}
      <div className="lg-messages" style={{
        flex: 1,
        padding: "16px 16px 8px",
        background: "#f8f9fa",
        display: "flex", flexDirection: "column", gap: 10,
        minHeight: 0,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "60px 20px", color: "#9ca3af", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <div style={{ fontWeight: 700, color: "#374151", fontSize: 15, marginBottom: 6 }}>
              Start the conversation
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              Say hi to {sellerName || "the seller"} — messages are private between you two.
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{
              display: "flex",
              justifyContent: m.from_me ? "flex-end" : "flex-start",
              alignItems: "flex-end", gap: 8,
            }}>
              {!m.from_me && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg,#1c7c45,#22c55e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: 11, flexShrink: 0,
                }}>
                  {initial}
                </div>
              )}
              <div style={{
                maxWidth: "75%",
                padding: "11px 15px",
                fontSize: 15, fontWeight: 500, lineHeight: 1.5,
                borderRadius: m.from_me ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background: m.from_me ? "#1c7c45" : "white",
                color: m.from_me ? "white" : "#111",
                boxShadow: m.from_me ? "0 2px 8px rgba(28,124,69,0.25)" : "0 1px 4px rgba(0,0,0,0.08)",
                wordBreak: "break-word",
              }}>
                {m.content}
                {m.time && (
                  <div style={{
                    fontSize: 10, marginTop: 4, opacity: 0.65,
                    textAlign: m.from_me ? "right" : "left",
                  }}>
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} style={{ height: 4 }} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        background: "white",
        borderTop: "1px solid #f0f1f3",
        padding: "10px 12px",
        display: "flex", gap: 10, alignItems: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <input
            ref={inputRef}
            className="lg-chat-input"
            type="text"
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_MSG_LENGTH))}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
            enterKeyHint="send"
            maxLength={MAX_MSG_LENGTH}
            style={{
              width: "100%",
              background: "#f3f4f6",
              borderRadius: 24,
              padding: "13px 18px",
              border: "2px solid transparent",
              fontSize: 16,
              color: "#111",
              fontFamily: "inherit",
              lineHeight: "normal",
              minWidth: 0,
              transition: "border-color 0.15s, background 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = "#1c7c45"; e.target.style.background = "#f0fdf4"; }}
            onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "#f3f4f6"; }}
          />
          {/* FIX 12: Character counter — show when near limit, positioned inside input */}
          {nearLimit && (
            <div style={{
              position: "absolute", bottom: 6, right: 14,
              fontSize: 10, color: charsLeft < 50 ? "#ef4444" : "#9ca3af", fontWeight: 600,
              pointerEvents: "none",
            }}>
              {charsLeft}
            </div>
          )}
        </div>
        <button
          className="lg-send-btn"
          onClick={send}
          disabled={!text.trim() || isSending || text.length > MAX_MSG_LENGTH}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: (text.trim() && !isSending) ? "#1c7c45" : "#e5e7eb",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: (text.trim() && !isSending) ? "pointer" : "default",
            flexShrink: 0,
            transition: "background 0.15s",
            boxShadow: (text.trim() && !isSending) ? "0 4px 12px rgba(28,124,69,0.35)" : "none",
          }}
        >
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
// ── FIX 16: Export wrapped in ErrorBoundary ──────────────────────
function LoopGenAppInner() {
  // ── Core state ──────────────────────────────────────
  const [screen,    setScreen]  = useState("splash");
  const [history,   setHistory] = useState([]);
  const [user,      setUser]    = useState(null);   // Supabase user object
  const [profile,   setProfile] = useState(null);   // profiles row
  const [authMode,  setAuthMode]= useState("login"); // "login" | "register" | "forgot"
  const [authForm,  setAuthForm]= useState({email:"",password:"",username:""});
  const [authError, setAuthError]= useState("");
  const [authLoading,setAuthLoading]= useState(false);
  const [sessionReady, setSessionReady] = useState(!HAS_SUPABASE);
  // FIX 2: Password reset state
  const [resetSent,    setResetSent]    = useState(false);
  // FIX 2: Recovery mode — true when user arrives via password reset link
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryPwd,  setRecoveryPwd]  = useState("");
  const [recoveryPwd2, setRecoveryPwd2] = useState("");
  const [recoveryErr,  setRecoveryErr]  = useState("");
  const [recoveryDone, setRecoveryDone] = useState(false);
  // Pending offers received as seller — drives notification badge
  const [pendingOffers, setPendingOffers] = useState([]);
  // FIX 7: Edit listing state
  const [editListing, setEditListing] = useState(null); // listing being edited | null

  // ── Data state ───────────────────────────────────────
  const [listings,  setListings]= useState(HAS_SUPABASE ? [] : [...DEMO_VINTAGE, ...DEMO_LISTINGS]);
  const [convos,    setConvos]  = useState(HAS_SUPABASE ? [] : DEMO_CONVOS);
  const [detail,    setDetail]  = useState(null);
  const [convo,     setConvo]   = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMsgs,  setChatMsgs]= useState([]);
  // chatContext: drives ChatScreen — includes messages directly to avoid async race
  // { id, sellerName, listingTitle }
  const [chatContext, setChatContext] = useState(null);
  // localChatStore: source of truth, keyed by chat id (survives navigation)
  // We use a ref so reads are always synchronous, and trigger re-renders via chatContext
  const localChatStore = useRef({});
  const [userListings, setUserListings]= useState([]);
  const [savedListings,setSavedListings]=useState([]);

  // ── Sell state ───────────────────────────────────────
  const [sellStep,  setSellStep]= useState(1);
  const [sell,      setSell]    = useState({title:"",price:"",category:"",sub:"",condition:"",desc:"",location:"",image_urls:[],tags:[]});
  const [sellImages,setSellImages]=useState([]); // blob: preview URLs
  const [sellImageFiles,setSellImageFiles]=useState([]); // raw File objects for upload
  const [uploadingImg,setUploadingImg]=useState(false);

  // ── UI state ─────────────────────────────────────────
  const [search,    setSearch]  = useState("");
  const [catFilter, setCatF]    = useState("All");
  const [msgText,   setMsgText] = useState("");
  const [aiLoading, setAiLoading]=useState(false);
  const [loading,   setLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(HAS_SUPABASE);
  const [toast,     setToast]   = useState(null);
  const [confirm,   setConfirm] = useState(null); // { msg, onConfirm }
  // P1 — Offer modal
  const [offerModal, setOfferModal] = useState(null); // { item } | null
  const [offerPrice, setOfferPrice] = useState("");
  const [offerSent,  setOfferSent]  = useState({}); // { [listingId]: price }
  const [offerSubmitting, setOfferSubmitting] = useState(false); // blocks double-tap
  // P1 — Report listing
  const [reportModal, setReportModal] = useState(null); // { item } | null
  // P5 — Terms agreement for register
  const [agreeTerms, setAgreeTerms] = useState(false);
  // Username edit (settings screen)
  const [editingUsername, setEditingUsername] = useState(false);
  const [showMoreCats, setShowMoreCats] = useState(false); // More Categories panel on home
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const listingsLoaded = useRef(false);
  const realtimeSub = useRef(null);
  const authInitialised = useRef(false); // guards against double-init on mount

  // ── T2: Auto-merge tags when title/category/condition change ────────────────
  useEffect(() => {
    if (!sell.category) return;
    const suggested = autoTagAssist(sell.title, sell.category, sell.condition);
    if (!suggested.length) return;
    setSell(f => {
      const cur = f.tags || [];
      const toAdd = suggested.filter(t => !cur.includes(t));
      if (!toAdd.length) return f; // nothing new — no re-render
      const merged = [...cur, ...toAdd].slice(0, MAX_TAGS);
      return { ...f, tags: merged };
    });
  }, [sell.title, sell.category, sell.condition]); // eslint-disable-line react-hooks/exhaustive-deps
  // ── APP VERSION CHECK — clears stale cache on new deploy ────────────────
  useEffect(() => {
    const stored = localStorage.getItem("app_version");
    if (stored !== APP_VERSION) {
      // version cache clear
      if ("caches" in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      const session = localStorage.getItem("sb-wknlvmsgjnsiamcbntek-auth-token");
      localStorage.clear();
      if (session) localStorage.setItem("sb-wknlvmsgjnsiamcbntek-auth-token", session);
      localStorage.setItem("app_version", APP_VERSION);
      // cache cleared
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Step 1 — restore any persisted session exactly once on mount.
    // We do this ourselves via getSession() so we can set sessionReady
    // synchronously and avoid the listener double-firing on startup.
    supabase.auth.getSession().then(({ data: { session } }) => {
      authInitialised.current = true;
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setSessionReady(true);
    });

    // Step 2 — listen for changes that happen AFTER the initial restore.
    // INITIAL_SESSION is skipped because authInitialised guards it.
    // TOKEN_REFRESHED is skipped — it doesn't change who's logged in.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Always skip until getSession() has run — avoids double init race
      if (!authInitialised.current) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setScreen(s => (s !== "auth" && s !== "splash") ? "splash" : s);
        setSessionReady(true);
        // Clear all chat state — prevents leaking between accounts
        localChatStore.current = {};
        setChatContext(null);
        setConvo(null);
      } else if (event === "PASSWORD_RECOVERY") {
        // User clicked the password reset link in their email.
        // Supabase has exchanged the token for a session — now show the
        // "set new password" UI. We stay on the auth screen.
        setUser(session?.user ?? null);
        setSessionReady(true);
        setRecoveryMode(true);
        setRecoveryPwd("");
        setRecoveryPwd2("");
        setRecoveryErr("");
        setRecoveryDone(false);
        setScreen("auth");
        setAuthMode("forgot"); // keeps the auth screen showing
      } else if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        // TOKEN_REFRESHED: token silently rotated, user object unchanged — ignore
        // INITIAL_SESSION: already handled by getSession() above — ignore
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        // Fires when handleAuth() calls signInWithPassword / signUp.
        // handleAuth() already called setUser + loadProfile directly,
        // so we only need to handle the case where handleAuth is NOT the caller
        // (e.g. magic link or OAuth callback).
        if (session?.user) {
          setUser(session.user);
          // Don't call loadProfile here — handleAuth already did it,
          // and calling it again can overwrite a freshly-saved username.
          // Instead just refresh profile state if we don't have it yet.
          setProfile(p => p ?? null);
        }
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data on screen change ────────────────────────
  useEffect(() => {
    if (screen === "home" || screen === "explore") {
      loadListings();
    }
    if (screen === "chats" && user) {
      loadConversations();
      // Also refresh pending offers received as seller
      dbGetPendingOffers(user.id).then(setPendingOffers);
    }
    if ((screen === "profile" || screen === "my-listings" || screen === "saved-items") && user) {
      loadProfileData();
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // When a real user logs in/out, force-refresh listings with their saved state
  // Also pre-load conversations and pending offers so badge shows immediately on home screen
  useEffect(() => {
    if (!HAS_SUPABASE) return; // demo mode never needs this
    listingsLoaded.current = false;
    if (screen === "home" || screen === "explore") {
      loadListings({ force: true });
    }
    // Pre-load conversations and pending offers so badge is visible immediately after login
    if (user) {
      loadConversations();
      dbGetPendingOffers(user.id).then(setPendingOffers);
    } else {
      // Logged out — clear ALL notification and chat state
      setConvos([]);
      setPendingOffers([]);
      localChatStore.current = {};
      setChatContext(null);
      setConvo(null);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime messages ────────────────────────────────
  useEffect(() => {
    if (!supabase || !convo?.id || String(convo.id).startsWith("mock_")) return;
    realtimeSub.current = supabase
      .channel(`messages:${convo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convo.id}` },
        payload => {
          const raw = payload.new;
          // Map DB 'body' column to 'content' for frontend consistency
          const msg = { ...raw, content: raw.body ?? raw.content ?? "" };
          const key = chatContext?.id;
          if (!key) return; // no active chat context — ignore
          // DEDUP FIX: If this message was sent by the current user, skip the realtime add.
          // The sender already sees an optimistic copy (added immediately on send).
          // Adding the DB echo would cause every sent message to appear twice.
          // The receiver (different user.id) still receives it normally via realtime.
          if (msg.sender_id === user?.id) return;
          // Dedup against localChatStore (same store ChatScreen reads from)
          const existing = localChatStore.current[key] || [];
          if (existing.find(m => m.id === msg.id)) return;
          // Route into the same store ChatScreen reads
          addMessageToStore(key, { ...msg, from_me: false });
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        })
      .subscribe();
    return () => { realtimeSub.current?.unsubscribe(); };
  }, [convo, user]);

  // ── Data loaders ─────────────────────────────────────
  async function loadListings({ force = false } = {}) {
    // ── Demo mode: data is synchronous, never show skeletons ──────────────
    if (!HAS_SUPABASE) {
      const data = [...DEMO_VINTAGE, ...DEMO_LISTINGS];
      setListings(data);
      listingsLoaded.current = true;
      return; // no loading state touched — listings already in state from init
    }
    // ── Supabase mode: only fetch once per session unless forced ──────────
    if (listingsLoaded.current && !force) return;
    setListingsLoading(true);
    try {
      const data = await dbGetListings(user?.id);
      // Always show real DB listings first. Only pad with demo Vintage items
      // when the DB is completely empty so the feed never looks blank.
      if (data.length === 0) {
        setListings([...DEMO_VINTAGE, ...DEMO_LISTINGS]);
      } else {
        setListings(data);
      }
      listingsLoaded.current = true;
    } catch (err) {
      console.error("loadListings:", err);
      // Keep showing demo data on error — do not blank the feed
    } finally {
      setListingsLoading(false);
    }
  }

  async function loadProfile(uid) {
    const p = await dbGetProfile(uid);
    if (p) {
      // Profile row exists — always use whatever username is stored, never overwrite
      setProfile(p);
    } else {
      // No profile row yet — create one with email-derived username as fallback.
      // This only runs for brand-new users who somehow bypassed registration.
      const { data: authData } = supabase ? await supabase.auth.getUser() : { data: {} };
      const email = authData?.user?.email || "";
      const username = email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "").replace(/_+$/g, "") || "user";
      await dbUpsertProfile(uid, { username, avatar_url: null });
      setProfile({ id: uid, username });
    }
  }

  async function loadConversations() {
    if (!user) return;
    const data = await dbGetConversations(user.id);
    setConvos(data);
  }

  async function loadProfileData() {
    if (!user) return;
    const [ul, sl, offers] = await Promise.all([
      dbGetUserListings(user.id),
      dbGetSavedListings(user.id),
      dbGetPendingOffers(user.id),
    ]);
    setUserListings(ul);
    setSavedListings(sl);
    setPendingOffers(offers);
  }

  // ── Navigation ───────────────────────────────────────
  const push = s => { setHistory(h => [...h, screen]); setScreen(s); };
  const pop  = () => { const h=[...history]; const prev=h.pop()||"home"; setHistory(h); setScreen(prev); if (screen === "sell") { setEditListing(null); } };
  const nav  = s => {
    if (s === "sell" && !sessionReady) { showToast("Loading…"); return; }
    if (s === "sell" && !user) { showToast("Sign in to sell items"); push("auth"); return; }
    if (s === "sell") { setEditListing(null); setSellStep(1); setSell({title:"",price:"",category:"",sub:"",condition:"",desc:"",location:"",image_urls:[],tags:[]}); setSellImages([]); setSellImageFiles([]); }
    setHistory([]); setScreen(s); setDetail(null); setConvo(null);
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  // ── Auth ─────────────────────────────────────────────
  // FIX 6: Email format validation — check before hitting the API
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  // FIX 3: Normalize username — lowercase, trimmed, only valid chars
  const normalizeUsername = (raw) =>
    raw.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "").replace(/_{2,}/g, "_").replace(/^[_.]|[_.]$/g, "") || null;

  // FIX 2: Handle password reset email request
  // FIX 2: Handle password reset — set new password after recovery link is clicked
  async function handleSetNewPassword() {
    if (!supabase) return;
    if (!recoveryPwd || recoveryPwd.length < 6) {
      setRecoveryErr("Password must be at least 6 characters."); return;
    }
    if (recoveryPwd !== recoveryPwd2) {
      setRecoveryErr("Passwords don't match. Please try again."); return;
    }
    setAuthLoading(true); setRecoveryErr("");
    try {
      const { error } = await supabase.auth.updateUser({ password: recoveryPwd });
      if (error) throw error;
      setRecoveryDone(true);
      // After 2.5s, clear recovery mode and go to home if logged in, else login
      setTimeout(() => {
        setRecoveryMode(false);
        setRecoveryPwd(""); setRecoveryPwd2("");
        if (user) { nav("home"); }
        else { setAuthMode("login"); setScreen("auth"); }
      }, 2500);
    } catch (e) {
      setRecoveryErr(e.message?.includes("same password")
        ? "New password must be different from your current password."
        : "Couldn't update password — please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!supabase) { showToast("Connect Supabase to enable auth"); return; }
    const email = authForm.email.trim();
    if (!email) { setAuthError("Please enter your email address first."); return; }
    if (!isValidEmail(email)) { setAuthError("Please enter a valid email address."); return; }
    setAuthLoading(true); setAuthError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/?recovery=1",
      });
      if (error) throw error;
      setResetSent(true);
    } catch (e) {
      setAuthError("Couldn't send reset email. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleAuth() {
    if (!supabase) { showToast("Connect Supabase to enable auth"); nav("home"); return; }

    // FIX 6: Validate email format before API call
    if (!isValidEmail(authForm.email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    // Enforce terms acceptance for registration
    if (authMode === "register" && !agreeTerms) {
      setAuthError("You must agree to the Terms of Service and Privacy Policy to register.");
      return;
    }
    setAuthLoading(true); setAuthError("");
    try {
      if (authMode === "register") {
        // FIX 3: Normalize and validate username before signup
        const rawUsername = authForm.username.trim();
        if (!rawUsername) { setAuthError("Please choose a username."); return; }
        if (rawUsername.length < 3) { setAuthError("Username must be at least 3 characters."); return; }
        const chosenUsername = normalizeUsername(rawUsername);
        // BUG FIX: If normalization removes all chars (e.g. "!!!"), reject with clear message
        if (!chosenUsername || chosenUsername.length < 3) {
          setAuthError("Username can only contain letters, numbers, _ and . — please choose a different one.");
          return;
        }

        // Check username availability before creating auth account
        const { data: existing } = await supabase
          .from("profiles").select("id").eq("username", chosenUsername).maybeSingle();
        if (existing) {
          setAuthError(`Username "${chosenUsername}" is already taken. Please choose another.`);
          return;
        }

        const { data, error } = await supabase.auth.signUp({ email: authForm.email.trim(), password: authForm.password });
        if (error) throw error;
        if (data.user && data.session) {
          await dbUpsertProfile(data.user.id, { username: chosenUsername, avatar_url: null });
          setUser(data.user);
          setProfile({ id: data.user.id, username: chosenUsername });
          showToast("🎉 Account created! Welcome to LoopGen.");
          nav("home");
        } else if (data.user && !data.session) {
          setAuthError("✅ Account created! Check your email to confirm before signing in.");
        } else {
          setAuthError("Something went wrong. Please try again.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authForm.email.trim(), password: authForm.password });
        if (error) {
          // FIX 6: Show friendly error instead of raw Supabase message
          if (error.message.toLowerCase().includes("invalid login")) {
            throw new Error("Incorrect email or password. Please try again.");
          }
          throw error;
        }
        setUser(data.user);
        await loadProfile(data.user.id);
        showToast("👋 Welcome back!");
        nav("home");
      }
    } catch (e) {
      setAuthError(e.message || "Authentication failed. Please try again.");
    } finally {
      // FIX 9: always clear loading state — even on unexpected throws
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    try { if (supabase) await supabase.auth.signOut(); } catch { /* ignore network errors */ }
    setUser(null); setProfile(null);
    nav("splash");
    showToast("Signed out");
  }

  // ── Listings ─────────────────────────────────────────
  const toggleSave = async (id, e) => {
    e?.stopPropagation();
    const item = listings.find(x => x.id === id);
    if (!item) return;
    // Optimistic update
    setListings(ls => ls.map(x => x.id===id ? {...x, is_saved:!x.is_saved} : x));
    showToast(item.is_saved ? "Removed from saved" : "❤️ Saved!");
    if (user) await dbToggleSave(id, user.id, item.is_saved);
  };

  const handleMarkSold = (listingId) => {
    setConfirm({
      msg: "Mark this item as sold?",
      onConfirm: async () => {
        try {
          await dbMarkAsSold(listingId, user.id);
          setUserListings(ls => ls.map(l => l.id===listingId ? {...l, status:"sold"} : l));
          showToast("✅ Marked as sold!");
        } catch (e) { showToast("Failed: " + e.message); }
        setConfirm(null);
      }
    });
  };

  const handleDeleteListing = (listingId) => {
    setConfirm({
      msg: "Remove this listing? This can't be undone.",
      onConfirm: async () => {
        try {
          await dbDeleteListing(listingId, user.id);
          setUserListings(ls => ls.filter(l => l.id !== listingId));
          setListings(ls => ls.filter(l => l.id !== listingId));
          showToast("Listing removed.");
        } catch (e) { showToast("Failed: " + e.message); }
        setConfirm(null);
      }
    });
  };

  const openDetail = async (item) => {
    // If seller_username is missing, fetch it fresh from profiles
    let enriched = { ...item };
    if (!enriched.seller_username && enriched.seller_id && supabase) {
      try {
        const { data: p } = await supabase
          .from("profiles").select("id, username, avatar_url")
          .eq("id", enriched.seller_id).maybeSingle();
        if (p?.username) {
          enriched.seller_username = p.username;
          enriched.seller_avatar   = p.avatar_url || null;
          // Update the cached listing too so subsequent opens are instant
          setListings(ls => ls.map(l => l.id === item.id
            ? { ...l, seller_username: p.username, seller_avatar: p.avatar_url || null }
            : l
          ));
        }
      } catch { /* non-critical — show whatever we have */ }
    }
    // If still missing and it's the logged-in user's own listing, use their profile
    if (!enriched.seller_username && user && enriched.seller_id === user.id && profile?.username) {
      enriched.seller_username = profile.username;
    }
    setDetail(enriched);
    push("detail");
  };

  // ── Sell / Photo upload ───────────────────────────────
  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
    if (!files.length) return;

    // FIX 10: Validate MIME type — reject non-image files before upload
    const invalidFiles = files.filter(f => !ALLOWED_IMAGE_TYPES.has(f.type));
    if (invalidFiles.length) {
      showToast(`${invalidFiles.length} file(s) rejected — only JPEG, PNG, WebP, or GIF allowed.`);
      return;
    }
    // Validate file sizes (max 10MB each)
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length) { showToast(`${oversized.length} photo(s) exceed 10MB limit`); return; }

    // ── Instant local previews (blob URLs) so photos show immediately ──────
    const remaining = 5 - sellImages.length;
    if (remaining <= 0) { showToast("Maximum 5 photos reached"); return; }
    const toAdd = files.slice(0, remaining);
    const blobUrls = toAdd.map(f => URL.createObjectURL(f));
    setSellImages(prev => [...prev, ...blobUrls]);
    setSellImageFiles(prev => [...prev, ...toAdd]);
    // Temporary blob URLs in sell.image_urls so preview step shows them
    setSell(f => ({...f, image_urls: [...f.image_urls, ...blobUrls].slice(0, 5)}));

    if (!user || !supabase) {
      showToast(`📸 ${toAdd.length} photo(s) added`);
      return;
    }

    // ── Background upload — swap blob URLs for real public URLs ────────────
    setUploadingImg(true);
    try {
      const uploadResults = await Promise.all(
        toAdd.map(async (file, i) => {
          try {
            const url = await dbUploadImage(file, user.id);
            // FIX 8: Revoke blob URL after successful upload to free memory
            URL.revokeObjectURL(blobUrls[i]);
            return { blobUrl: blobUrls[i], publicUrl: url };
          } catch {
            return { blobUrl: blobUrls[i], publicUrl: null };
          }
        })
      );
      const failed = uploadResults.filter(r => !r.publicUrl).length;
      // Swap blob URLs for real URLs in state
      setSellImages(prev => prev.map(url => {
        const match = uploadResults.find(r => r.blobUrl === url);
        return (match && match.publicUrl) ? match.publicUrl : url;
      // FIX 2: Remove any remaining blob:// URLs (failed uploads) — never show/save them
      }).filter(url => !url.startsWith("blob:")));
      setSell(f => ({
        ...f,
        image_urls: f.image_urls.map(url => {
          const match = uploadResults.find(r => r.blobUrl === url);
          return (match && match.publicUrl) ? match.publicUrl : url;
        // FIX 2: Strip any remaining blob:// URLs — failed uploads must not reach DB
        }).filter(url => url && !url.startsWith("blob:")),
      }));
      if (failed > 0) showToast(`⚠️ ${failed} photo(s) failed — removed from listing`);
      else showToast(`📸 ${toAdd.length} photo(s) uploaded`);
    } catch (e) {
      showToast("Upload failed — " + e.message);
    }
    setUploadingImg(false);
  }

  async function handleList() {
    if (!sell.title || !sell.price || !sell.category || !sell.condition) {
      showToast("Please fill all required fields"); return;
    }
    // BUG FIX: Capture destination BEFORE any state changes — editListing will be null after clear
    const postSaveDestination = editListing ? "my-listings" : "home";
    setLoading(true);
    try {
      const listingData = {
        title: sell.title.trim().slice(0, 100),
        price: parseFloat(sell.price),
        category: sell.category,
        sub: sell.sub,
        condition: sell.condition,
        description: sell.desc.slice(0, 2000),
        location: sell.location || "Australia",
        image_urls: sell.image_urls.filter(u => u && !u.startsWith("blob:")),
        tags: sell.tags || [],
      };

      if (editListing && user && supabase) {
        // FIX 7: EDIT MODE — update existing listing
        const updated = await dbUpdateListing(editListing.id, user.id, listingData);
        showToast("✅ Listing updated!");
        if (updated) {
          const enriched = { ...updated, seller_username: profile?.username || currentUser, time: "Just now", is_saved: false };
          setListings(ls => ls.map(l => l.id === editListing.id ? { ...l, ...enriched } : l));
          setUserListings(ls => ls.map(l => l.id === editListing.id ? { ...l, ...updated } : l));
        }
        setEditListing(null);
      } else if (user && supabase) {
        const created = await dbCreateListing(listingData, user.id);
        showToast("🎉 Listed! Your item is live.");
        if (created) {
          const optimistic = {
            ...created,
            seller_username: profile?.username || currentUser,
            seller_avatar: profile?.avatar_url || null,
            image_urls: created.image_urls || [],
            tags: created.tags || [],
            time: "Just now",
            is_saved: false,
          };
          setListings(ls => [optimistic, ...ls]);
        }
        listingsLoaded.current = false;
        await loadListings({ force: true });
      } else {
        // Demo mode — add locally
        const newItem = { ...listingData, id: `local_${Date.now()}`, seller_username: "you", time: "Just now", is_saved: false };
        setListings(ls => [newItem, ...ls]);
        showToast("🎉 Listed! (Demo mode)");
      }
      setSellStep(1);
      setSell({title:"",price:"",category:"",sub:"",condition:"",desc:"",location:"",image_urls:[],tags:[]});
      // FIX 8: Revoke any remaining blob URLs before clearing state
      setSellImages(prev => { prev.forEach(url => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); }); return []; });
      setSellImageFiles([]);
      nav(postSaveDestination);
    } catch (e) {
      showToast("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── AI description ─────────────────────────────────────
  const aiGen = async () => {
    if (!sell.title) { showToast("Add a title first!"); return; }
    if (!supabase) { showToast("AI requires Supabase Edge Function"); return; }
    setAiLoading(true);
    try {
      const desc = await dbAiDescription(sell.title, sell.category, sell.condition);
      if (desc) { setSell(f=>({...f, desc})); showToast("✨ AI description ready!"); }
      else showToast("AI unavailable");
    } catch { showToast("AI unavailable"); }
    setAiLoading(false);
  };

  // ── Chat ──────────────────────────────────────────────
  // Stable key for a conversation — MUST be identical everywhere
  // chatKey: ALWAYS keyed by listing id + seller username — never by conv/message id
  // item can be: a listing object (has .id = listing id)
  //              a conversation object (has .listing_id, .seller_username)
  const chatKey = (item) => {
    const seller = (item.seller_username || item.other_user || "seller").trim();
    // Prefer explicit listing_id (conv objects), then id only if it looks like a listing id
    // (not a UUID from conversations table)
    const listingId = item.listing_id || item.id || item.title || "item";
    return `chat_${seller}_${listingId}`.replace(/\s+/g, "_").toLowerCase();
  };

  // addMessageToStore: synchronously mutates the ref, then forces a re-render
  // by updating chatContext (which ChatScreen reads messages from via the ref)
  const addMessageToStore = (key, msg) => {
    const store = localChatStore.current;
    store[key] = [...(store[key] || []), msg];
    // Force ChatScreen to re-render with new messages
    setChatContext(ctx => ctx ? { ...ctx } : ctx);
  };

  // openChat: single entry point — always synchronous, no async state race
  const openChat = (item, seedMessages = []) => {
    const key = chatKey(item);
    const store = localChatStore.current;
    const existing = store[key] || [];

    if (seedMessages.length > 0) {
      // Append seeds that aren't already stored (dedup by id)
      const existingIds = new Set(existing.map(m => m.id));
      const toAdd = seedMessages.filter(m => !existingIds.has(m.id));
      if (toAdd.length > 0) {
        store[key] = [...existing, ...toAdd];
      }
    } else if (!store[key]) {
      // First time opening this convo with no seeds — initialise empty
      store[key] = [];
    }
    // Set context and navigate — single synchronous update, no race
    setChatContext({
      id: key,
      convId: item.convId || (item.id && !item.id.startsWith("chat_") ? item.id : null),
      sellerName: item.seller_username || item.other_user || "Seller",
      listingTitle: item.title || item.listing_title || "Item",
    });
    push("chat");
  };

  // openConvo: used by the chats list screen — always fetches fresh from Supabase
  const openConvo = async (c) => {
    // Show chat immediately with empty/cached messages, then load fresh
    setConvo(c);         // FIX: triggers realtime subscription for this conversation
    openChat({ ...c, convId: c.id }, []);
    if (supabase && user && c.id && !String(c.id).startsWith("mock_")) {
      try {
        const fetched = await dbGetMessages(c.id);
        const msgs = fetched.map(m => ({ ...m, from_me: m.sender_id === user.id }));
        const key = chatKey(c);
        const store = localChatStore.current;
        store[key] = msgs;
        setChatContext(ctx => ctx ? { ...ctx, convId: c.id } : ctx);
      } catch (e) { console.error("openConvo fetch error:", e); }
    }
  };

  const openSellerChat = async (item, initialMessage = null) => {
    // Block seller messaging their own listing — check both Supabase id and username (demo mode)
    if (user) {
      const ownById = item.seller_id && item.seller_id === user.id;
      const ownByUsername = !item.seller_id && item.seller_username &&
        item.seller_username === (profile?.username || user.email?.split("@")[0]);
      if (ownById || ownByUsername) { showToast("That's your own listing!"); return; }
    }
    // No auth gate — works for guests and logged-in users
    if (!supabase || !user) {
      openChat(item, []);
      return;
    }
    try {
      const conv = await dbGetOrCreateConversation(item.id, user.id, item.seller_id);
      if (conv) {
        const msgs = await dbGetMessages(conv.id);
        const enriched = {
          ...conv,
          convId: conv.id, // real Supabase conversation UUID for message persistence
          listing_id: item.id,
          seller_username: item.seller_username || "Seller",
          title: item.title || "Item",
        };
        setConvos(cs => cs.find(c => c.id === conv.id) ? cs : [enriched, ...cs]);
        setConvo(conv);  // triggers realtime subscription for this conversation
        // If an initial message was provided (e.g. from offer submission), send it to DB
        if (initialMessage) {
          const localMsg = {
            id: `msg_${Date.now()}`,
            from_me: true,
            content: initialMessage,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          const key = chatKey(enriched);
          const store = localChatStore.current;
          // DEDUP FIX: Replace store with DB messages + ONE optimistic local message.
          // Do NOT append to existing store — existing may already contain an old copy.
          const dbMsgs = msgs.map(m => ({ ...m, from_me: m.sender_id === user.id }));
          store[key] = [...dbMsgs, localMsg];
          // Persist to DB with the correct conversation UUID
          try {
            await dbSendMessage(conv.id, user.id, initialMessage);
          } catch (e) {
            console.error("[LoopGen] Offer message save failed:", e);
            showToast("Offer sent but message couldn't save — check connection.");
          }
          setChatContext({
            id: key,
            convId: conv.id,
            sellerName: enriched.seller_username,
            listingTitle: enriched.title,
          });
          push("chat");
        } else {
          // No initialMessage — opening an existing conversation.
          // REPLACE the store with fresh DB messages so any stale optimistic
          // local messages (msg_DATE IDs) don't persist alongside DB UUIDs.
          const key = chatKey(enriched);
          const dbMsgs = msgs.map(m => ({ ...m, from_me: m.sender_id === user.id }));
          localChatStore.current[key] = dbMsgs;
          setChatContext({
            id: key,
            convId: conv.id,
            sellerName: enriched.seller_username,
            listingTitle: enriched.title,
          });
          push("chat");
        }
      } else {
        openChat(item, []);
      }
    } catch (e) {
      console.error("openSellerChat:", e);
      openChat(item, []);
    }
  };

  // sendMsg is now handled inside ChatScreen via onSend → addMessageToStore
  // This legacy function kept for any remaining references but should not be called
  const sendMsg = async () => { console.warn("[LoopGen] Legacy sendMsg called"); };

  // ── Derived data ──────────────────────────────────────
  const filtered = listings.filter(l => {
    const ms = l.title?.toLowerCase().includes(search.toLowerCase()) || l.category?.toLowerCase().includes(search.toLowerCase()) || l.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return ms && (catFilter==="All" || l.category===catFilter);
  });

  const CATS = ["All","Vintage & Collectibles","Fashion","Electronics","Home","Sports","Vehicles","Pets","Tickets","Music, Books & Games","Cars & Vehicles","Baby & Kids","Boats & Jet Skis","Miscellaneous","Freebies"];
  const currentUser = user ? (profile?.username || user.email?.split("@")[0] || "You") : "Guest";
  const isGuest = !user;

  // ════════════════════════════
  //  SPLASH  (LandingPage component)
  // ════════════════════════════
  if (screen === "splash") return (
    <Phone>
      <LandingPage
        onBrowse={() => nav("home")}
        onSell={() => nav("sell")}
        onSignIn={() => { setAuthMode("login"); push("auth"); }}
        onRegister={() => { setAuthMode("register"); push("auth"); }}
        demoMode={!HAS_SUPABASE}
      />
    </Phone>
  );

  //  AUTH
  // ════════════════════════════
  if (screen === "auth") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 28px 40px",display:"flex",flexDirection:"column"}}>
        <div onClick={() => { pop(); setAuthError(""); setResetSent(false); setAuthMode("login"); }} style={{cursor:"pointer",marginBottom:24}}><IcoBack/></div>
        <LoopGenLogo height={36} style={{marginBottom:20}} />

        {/* ── FORGOT PASSWORD MODE ── */}
        {authMode === "forgot" ? (
          <>
            {/* ── RECOVERY MODE: user arrived via password reset link ── */}
            {recoveryMode ? (
              <>
                <div style={{fontSize:24,fontWeight:900,color:"#111",marginBottom:4}}>Set new password</div>
                <div style={{fontSize:14,color:"#6b7280",marginBottom:28}}>
                  Choose a new password for your account.
                </div>
                {recoveryDone ? (
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:14,padding:"20px 16px",textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>✅</div>
                    <div style={{fontWeight:700,color:"#166534",fontSize:15,marginBottom:6}}>Password updated!</div>
                    <div style={{fontSize:13,color:"#4b7c5a",lineHeight:1.6}}>
                      You're being signed in now…
                    </div>
                  </div>
                ) : (
                  <>
                    <FInp placeholder="New password (min 6 chars)" type="password"
                      value={recoveryPwd} onChange={v=>{ setRecoveryPwd(v); setRecoveryErr(""); }}/>
                    <FInp placeholder="Confirm new password" type="password"
                      value={recoveryPwd2} onChange={v=>{ setRecoveryPwd2(v); setRecoveryErr(""); }}/>
                    {recoveryErr && (
                      <div style={{color:"#ef4444",fontSize:13,marginBottom:12,fontWeight:500,lineHeight:1.5}}>
                        {recoveryErr}
                      </div>
                    )}
                    <GreenBtn onClick={handleSetNewPassword} disabled={authLoading} mt={8}>
                      {authLoading ? "Saving…" : "Set New Password"}
                    </GreenBtn>
                  </>
                )}
              </>
            ) : (
              /* ── STANDARD FORGOT: send reset email ── */
              <>
            <div style={{fontSize:24,fontWeight:900,color:"#111",marginBottom:4}}>Reset password</div>
            <div style={{fontSize:14,color:"#6b7280",marginBottom:28}}>
              Enter your email and we'll send a reset link.
            </div>
            {resetSent ? (
              <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:14,padding:"18px 16px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:8}}>📧</div>
                <div style={{fontWeight:700,color:"#166534",fontSize:15,marginBottom:6}}>Check your inbox</div>
                <div style={{fontSize:13,color:"#4b7c5a",lineHeight:1.6}}>
                  We've sent a reset link to <strong>{authForm.email}</strong>.
                  Follow the link in the email to set a new password.
                </div>
                <button onClick={() => { setAuthMode("login"); setResetSent(false); setAuthError(""); }}
                  style={{marginTop:16,padding:"12px 24px",borderRadius:50,background:GREEN,border:"none",
                    color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {!HAS_SUPABASE && (
                  <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",marginBottom:20,fontSize:12,color:"#166534",fontWeight:600,border:"1px solid #bbf7d0"}}>
                    🌱 Demo mode — password reset requires a live Supabase connection.
                  </div>
                )}
                <FInp placeholder="Email" type="email" value={authForm.email} onChange={v=>setAuthForm(f=>({...f,email:v}))}/>
                {authError && <div style={{color:"#ef4444",fontSize:13,marginBottom:12,fontWeight:500}}>{authError}</div>}
                <GreenBtn onClick={handlePasswordReset} disabled={authLoading} mt={8}>
                  {authLoading ? "Sending…" : "Send Reset Link"}
                </GreenBtn>
                <div style={{textAlign:"center",marginTop:16}}>
                  <span onClick={() => { setAuthMode("login"); setAuthError(""); }}
                    style={{fontSize:13,color:GREEN,fontWeight:700,cursor:"pointer"}}>
                    ← Back to Sign In
                  </span>
                </div>
              </>
            )}
            </>)} {/* end standard forgot / end recoveryMode ternary */}
          </>
        ) : (
          /* ── LOGIN / REGISTER MODE ── */
          <>
            <div style={{fontSize:26,fontWeight:900,color:"#111",marginBottom:4}}>
              {authMode==="login" ? "Welcome back 👋" : "Join LoopGen 🌱"}
            </div>
            <div style={{marginBottom:6,fontSize:13,fontWeight:800,color:GREEN}}>Buy and sell with ease.</div>
            <div style={{fontSize:14,color:"#6b7280",marginBottom:28}}>
              {authMode==="login" ? "Sign in to your account" : "Create your free account"}
            </div>

            {!HAS_SUPABASE && (
              <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",marginBottom:20,fontSize:12,color:"#166534",fontWeight:600,border:"1px solid #bbf7d0"}}>
                🌱 Demo build — accounts aren't live yet. Use "Explore the Demo →" to browse listings.
              </div>
            )}

            {authMode==="register" && (
              <div style={{marginBottom:0}}>
                <FInp placeholder="Username (3–30 chars)" value={authForm.username}
                  onChange={v=>setAuthForm(f=>({...f,username:v}))}/>
                <div style={{fontSize:11,color:"#9ca3af",marginTop:-8,marginBottom:12,paddingLeft:2}}>
                  Letters, numbers, _ and . only · Will be shown to other users
                </div>
              </div>
            )}
            <FInp placeholder="Email" type="email" value={authForm.email} onChange={v=>setAuthForm(f=>({...f,email:v}))}/>
            <FInp placeholder="Password (min 6 chars)" type="password" value={authForm.password} onChange={v=>setAuthForm(f=>({...f,password:v}))}/>

            {/* Forgot password link — only on login */}
            {authMode === "login" && (
              <div style={{textAlign:"right",marginTop:-6,marginBottom:16}}>
                <span onClick={() => { setAuthMode("forgot"); setAuthError(""); setResetSent(false); }}
                  style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>
                  Forgot password?
                </span>
              </div>
            )}

            {authMode==="register" && (
              <label style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:16,cursor:"pointer"}}>
                <input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)}
                  style={{width:16,height:16,marginTop:2,accentColor:GREEN,flexShrink:0,cursor:"pointer"}}/>
                <span style={{fontSize:12,color:"#6b7280",lineHeight:1.55}}>
                  I agree to the{" "}
                  <a href="https://www.loopgen.com.au/terms" style={{color:GREEN,fontWeight:700,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="https://www.loopgen.com.au/privacy" style={{color:GREEN,fontWeight:700,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>Privacy Policy</a>
                </span>
              </label>
            )}

            {authError && <div style={{color:"#ef4444",fontSize:13,marginBottom:12,fontWeight:500,lineHeight:1.5}}>{authError}</div>}

            <GreenBtn onClick={handleAuth} disabled={authLoading || (authMode==="register" && !agreeTerms)} mt={8}>
              {authLoading ? "Loading…" : authMode==="login" ? "Sign In" : "Create Account"}
            </GreenBtn>

            <div style={{textAlign:"center",marginTop:20,fontSize:13,color:"#6b7280"}}>
              {authMode==="login" ? "No account? " : "Have an account? "}
              <span onClick={() => { setAuthMode(authMode==="login"?"register":"login"); setAuthError(""); setAgreeTerms(false); }}
                style={{color:GREEN,fontWeight:700,cursor:"pointer"}}>
                {authMode==="login" ? "Register" : "Sign In"}
              </span>
            </div>
          </>
        )}
      </div>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  HOME
  // ════════════════════════════
  if (screen === "home") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div className="lg-main-scroll" style={{flex:1,overflowY:"auto",paddingBottom:84}}>

        {/* ── TOP NAV BAR ── */}
        <div style={{padding:"8px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f5f5f5"}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <LoopGenLogo height={28} />
          </div>
          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>nav("explore")} style={{width:36,height:36,borderRadius:12,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IcoSearch c="#374151"/></div>
            <div onClick={()=>nav("profile")} style={{width:36,height:36,borderRadius:12,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IcoUser c="#374151"/></div>
          </div>
        </div>

        {/* ── HERO SECTION ── */}
        <div style={{background:`linear-gradient(145deg,#0d5c33 0%,${GREEN} 55%,#22c55e 100%)`,padding:"26px 20px 28px",position:"relative",overflow:"hidden"}}>
          {/* Decorative circles */}
          <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}}/>
          <div style={{position:"absolute",bottom:-20,right:20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
          <div style={{position:"absolute",top:20,right:-10,width:60,height:60,borderRadius:"50%",background:"rgba(34,197,94,0.25)"}}/>

          <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:600,letterSpacing:0.3,marginBottom:6}}>
            Hey {isGuest?"there":currentUser} 👋
          </div>
          <h1 style={{color:"white",fontSize:24,fontWeight:900,lineHeight:1.2,marginBottom:6,letterSpacing:-0.5}}>
            Discover unique items<br/>around you
          </h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:13,fontWeight:500,marginBottom:20,lineHeight:1.5}}>
            Buy and sell in a smarter circular marketplace.
          </p>

          {/* Hero search bar */}
          <div onClick={()=>nav("explore")} style={{background:"white",borderRadius:14,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
            <IcoSearch c="#9ca3af"/>
            <span style={{color:"#9ca3af",fontSize:14,flex:1}}>Search vintage, tech, fashion…</span>
          </div>

          {/* Hero CTAs */}
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={()=>nav("explore")} style={{flex:1,padding:"12px",borderRadius:12,border:"2px solid rgba(255,255,255,0.7)",background:"transparent",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Browse Items
            </button>
            <button onClick={()=>nav("sell")} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:"white",color:GREEN,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
              + Sell an Item
            </button>
          </div>
        </div>

        <HomeTicker />

        {/* ── CATEGORIES GRID ── */}
        <div style={{padding:"20px 16px 4px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:16,fontWeight:900,color:"#111",letterSpacing:"-0.3px"}}>Browse by Category</span>
            <span onClick={()=>nav("explore")} style={{fontSize:12,color:GREEN,fontWeight:700,cursor:"pointer"}}>See all ›</span>
          </div>

          {/* ── Primary 6 tiles ── */}
          {(() => {
            const PRIMARY_CATS = [
              { cat:"Vintage & Collectibles", label:"Vintage",
                bg:"linear-gradient(160deg,#1a0040 0%,#4c1d95 100%)", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=90" },
              { cat:"Electronics", label:"Tech",
                bg:"linear-gradient(160deg,#001433 0%,#1e3a8a 100%)", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=90",
                imgPos:"center 40%" },
              { cat:"Fashion", label:"Fashion",
                bg:"linear-gradient(160deg,#3b0019 0%,#be123c 100%)", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=90",
                imgPos:"center top" },
              { cat:"Home", label:"Home",
                bg:"linear-gradient(160deg,#1a0e00 0%,#b45309 100%)", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=90" },
              { cat:"Sports", label:"Sports",
                bg:"linear-gradient(160deg,#001a10 0%,#065f46 100%)", tintOpacity:0.50,
                img:"https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&q=90" },
              { cat:"__more__", label: showMoreCats ? "Show Less ↑" : "More Categories ↓",
                bg:"linear-gradient(160deg,#0f0f0f 0%,#1c7c45 100%)", tintOpacity:0.72,
                img:"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=90" },
            ];
            return (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {PRIMARY_CATS.map(({cat,label,bg,img,imgPos,tintOpacity})=>(
                  <div key={cat}
                    onClick={()=>{
                      if (cat==="__more__") { setShowMoreCats(v=>!v); }
                      else { setCatF(cat); nav("explore"); }
                    }}
                    className={cat==="__more__" ? "lg-cat-tile-more" : "lg-cat-tile"}
                    style={{borderRadius:22,overflow:"hidden",cursor:"pointer",position:"relative",
                      aspectRatio:"1/1.15",boxShadow:"0 6px 22px rgba(0,0,0,0.28)",
                      border: cat==="__more__" && showMoreCats
                        ? `2px solid ${GREEN}`
                        : "1px solid rgba(255,255,255,0.06)"}}>
                    <img src={img} alt={label}
                      style={{position:"absolute",inset:0,width:"100%",height:"100%",
                        objectFit:"cover",objectPosition:imgPos||"center",display:"block"}}
                      onError={e=>{e.target.style.display="none"}}/>
                    <div style={{position:"absolute",inset:0,background:bg,opacity:tintOpacity||0.50}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",
                      background:"linear-gradient(to top,rgba(0,0,0,0.80) 0%,transparent 100%)"}}/>
                    <div style={{position:"absolute",bottom:11,left:0,right:0,textAlign:"center",zIndex:3}}>
                      <span style={{fontSize:13,fontWeight:900,color:"white",letterSpacing:"0.01em",
                        textShadow:"0 2px 6px rgba(0,0,0,0.6)",padding:"0 4px",display:"block",lineHeight:1.25}}>
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── More Categories panel — 8 extra photo tiles matching primary style ── */}
          {showMoreCats && (
            <div style={{marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",
                letterSpacing:"0.08em",marginBottom:10,paddingLeft:2}}>
                More Categories
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[
                  { cat:"Pets",                 label:"Pets",
                    bg:"linear-gradient(160deg,#c4a090 0%,#ddc0b0 100%)",
                    img:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Tickets",              label:"Tickets",
                    bg:"linear-gradient(160deg,#a090c8 0%,#c8b8e8 100%)",
                    img:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Music, Books & Games", label:"Music & Books",
                    bg:"linear-gradient(160deg,#7a9fb8 0%,#aacce0 100%)",
                    img:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Cars & Vehicles",      label:"Cars",
                    bg:"linear-gradient(160deg,#8a8580 0%,#b8b3ae 100%)",
                    img:"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Baby & Kids",          label:"Baby & Kids",
                    bg:"linear-gradient(160deg,#c87890 0%,#e8a8b8 100%)",
                    img:"https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Boats & Jet Skis",     label:"Boats",
                    bg:"linear-gradient(160deg,#7aaab8 0%,#aaccd8 100%)",
                    img:"https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Miscellaneous",        label:"Misc Goods",
                    bg:"linear-gradient(160deg,#8a9aa8 0%,#b8c8d5 100%)",
                    img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=340&fit=crop&auto=format&q=80" },
                  { cat:"Freebies",             label:"Freebies",
                    bg:"linear-gradient(160deg,#80a888 0%,#aacca8 100%)",
                    img:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=340&fit=crop&auto=format&q=80" },
                ].map(({cat,label,bg,img})=>(
                  <div key={cat}
                    onClick={()=>{ setCatF(cat); setShowMoreCats(false); nav("explore"); }}
                    className="lg-cat-tile-more"
                    style={{borderRadius:18,overflow:"hidden",cursor:"pointer",position:"relative",
                      aspectRatio:"1/1.15",background:bg,
                      boxShadow:"0 4px 14px rgba(0,0,0,0.18)",
                      border:"1px solid rgba(255,255,255,0.06)"}}>
                    {/* Photo — luminosity blend preserves gradient colour, adds texture */}
                    <img src={img} alt={label}
                      style={{position:"absolute",inset:0,width:"100%",height:"100%",
                        objectFit:"cover",objectPosition:"center",display:"block",
                        mixBlendMode:"luminosity",opacity:0.90}}
                      onError={e=>{e.target.style.display="none"}}/>
                    {/* Bottom gradient for label legibility */}
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:"45%",
                      background:"linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 100%)"}}/>
                    {/* Label */}
                    <div style={{position:"absolute",bottom:8,left:0,right:0,
                      textAlign:"center",zIndex:3,padding:"0 4px"}}>
                      <span style={{fontSize:13,fontWeight:900,color:"white",
                        letterSpacing:"0.01em",lineHeight:1.2,display:"block",
                        textShadow:"0 1px 4px rgba(0,0,0,0.5)"}}>
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* ── TRENDING VINTAGE ── */}
        {(() => {
          const vintageItems = listings.filter(l => l.category === "Vintage & Collectibles").slice(0, 8);
          if (!vintageItems.length) return null;
          return (
            <div style={{marginTop:22,marginBottom:4}}>
              <div style={{padding:"0 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:15,fontWeight:800,color:"#111"}}>🔥 Trending near you</span>
                </div>
                <span onClick={()=>{setCatF("Vintage & Collectibles");nav("explore");}} style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>See all ›</span>
              </div>
              {/* Category banner */}
              <div style={{margin:"0 16px 12px",borderRadius:18,background:"linear-gradient(135deg,#4c1d95 0%,#7c3aed 50%,#a855f7 100%)",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,overflow:"hidden",position:"relative"}}>
                <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
                <div style={{fontSize:28}}>{String.fromCodePoint(0x1F3B5)}</div>
                <div>
                  <div style={{color:"white",fontWeight:800,fontSize:13,letterSpacing:0.2}}>Vintage & Collectibles</div>
                  <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,marginTop:1}}>Vinyl · Cameras · Retro games · Y2K fashion</div>
                </div>
              </div>
              <div className="lg-hscroll" style={{display:"flex",gap:12,overflowX:"auto",paddingLeft:16,paddingRight:16,paddingBottom:6,scrollbarWidth:"none"}}>
                {listingsLoading
                  ? Array.from({length:4}).map((_,i) => <SkeletonCard key={i} compact/>)
                  : vintageItems.map(item => (
                      <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave} compact/>
                    ))
                }
                <div style={{flexShrink:0,width:16}} aria-hidden="true"/>
              </div>
            </div>
          );
        })()}

        {/* ── NEW LISTINGS ── */}
        <div style={{padding:"20px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:15,fontWeight:800,color:"#111"}}>✨ New listings</span>
            <span onClick={()=>nav("explore")} style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>See all ›</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {listingsLoading
              ? Array.from({length:4}).map((_,i) => <SkeletonCard key={i}/>)
              : listings.slice(0,6).map(item => (
                  <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave}/>
                ))
            }
          </div>
          {listings.length > 6 && (
            <button onClick={()=>nav("explore")} style={{width:"100%",marginTop:14,padding:"14px",borderRadius:14,border:`1.5px solid ${GREEN}`,background:"white",color:GREEN,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              View all {listings.length} listings →
            </button>
          )}
        </div>

        {/* ── POPULAR ITEMS ── */}
        {(() => {
          // Popular = highest rated / most-saved items across all categories, excluding vintage (already shown)
          const popular = listings
            .filter(l => l.category !== "Vintage & Collectibles")
            .sort((a,b) => (b.rating||0) - (a.rating||0))
            .slice(0, 8);
          if (!popular.length) return null;
          return (
            <div style={{marginTop:24,marginBottom:4}}>
              <div style={{padding:"0 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:15,fontWeight:800,color:"#111"}}>⭐ Popular items</span>
                <span onClick={()=>nav("explore")} style={{fontSize:12,color:GREEN,fontWeight:600,cursor:"pointer"}}>See all ›</span>
              </div>
              <div className="lg-hscroll" style={{display:"flex",gap:12,overflowX:"auto",paddingLeft:16,paddingRight:16,paddingBottom:6,scrollbarWidth:"none"}}>
                {popular.map(item => (
                  <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave} compact/>
                ))}
                <div style={{flexShrink:0,width:16}} aria-hidden="true"/>
              </div>
            </div>
          );
        })()}

        {/* ── TRUST FOOTER ── */}
        <div style={{margin:"24px 16px 8px",padding:"18px 16px",background:"#f8faff",borderRadius:18,border:"1px solid #e5e7eb"}}>
          <div style={{fontSize:11,color:"#6b7280",lineHeight:1.6,marginBottom:10}}>
            LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620).
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <a href="https://www.loopgen.com.au/terms"    style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Terms</a>
            <a href="https://www.loopgen.com.au/privacy"  style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Privacy</a>
            <a href="https://www.loopgen.com.au/trust"    style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Safety</a>
            <a href="mailto:support@loopgen.com.au" style={{fontSize:11,color:GREEN,fontWeight:600,textDecoration:"none"}}>Contact</a>
          </div>
        </div>

      </div>
      <BottomNav active="home" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  EXPLORE
  // ════════════════════════════
  if (screen === "explore") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div className="lg-explore-root" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
      {/* Search */}
      <div style={{padding:"4px 16px 10px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div onClick={pop} style={{cursor:"pointer",flexShrink:0}}><IcoBack/></div>
          <span style={{fontSize:16,fontWeight:800,color:"#111"}}>Browse Listings</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#f3f4f6",borderRadius:14,padding:"12px 16px"}}>
          <IcoSearch c="#9ca3af"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vintage, tech, fashion…" autoFocus
            style={{flex:1,border:"none",background:"transparent",fontSize:14,outline:"none",color:"#374151",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          {search && <span onClick={()=>setSearch("")} style={{color:"#9ca3af",cursor:"pointer",fontSize:16,lineHeight:1}}>✕</span>}
        </div>
      </div>
      {/* Category pills */}
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 20px 12px",flexShrink:0,scrollbarWidth:"none"}}>
        {CATS.map(c => {
          const isVintage = c === "Vintage & Collectibles";
          const isActive = catFilter === c;
          return (
            <button key={c} onClick={()=>setCatF(c)} style={{flexShrink:0,padding:"7px 16px",borderRadius:24,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",
              background: isActive ? (isVintage ? "linear-gradient(135deg,#7c3aed,#a855f7)" : GREEN) : (isVintage ? "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(168,85,247,0.1))" : "#f3f4f6"),
              color: isActive ? "white" : (isVintage ? "#7c3aed" : "#6b7280"),
              boxShadow: isActive && isVintage ? "0 4px 14px rgba(124,58,237,0.4)" : "none",
              transition:"all 0.15s"}}>
              {isVintage ? "✦ Vintage" : c}
            </button>
          );
        })}
      </div>
      {/* Results */}
      <div className="lg-explore-scroll" style={{flex:1,overflowY:"auto",padding:"0 16px",paddingBottom:84}}>
        {!listingsLoading && filtered.length > 0 && (
          <div style={{fontSize:12,color:"#9ca3af",fontWeight:600,marginBottom:10,paddingTop:2}}>
            {filtered.length} listing{filtered.length!==1?"s":""}{search?` for "${search}"`:catFilter!=="All"?` in ${catFilter}`:""}
          </div>
        )}
        {listingsLoading ? (
          <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:4}}>
            {Array.from({length:6}).map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",color:"#9ca3af",fontSize:14,paddingTop:60}}>
            <div style={{fontSize:40,marginBottom:12}}>{String.fromCodePoint(0x1F50D)}</div>
            <div style={{fontWeight:700,color:"#374151",fontSize:15,marginBottom:6}}>No listings found</div>
            <div style={{fontSize:13}}>{search ? `Try a different search term` : `Nothing in ${catFilter} yet`}</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:4}}>
            {filtered.map(item => (
              <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave}/>
            ))}
          </div>
        )}
      </div>
      </div>
      <BottomNav active="explore" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  DETAIL
  // ════════════════════════════
  if (screen === "detail" && !detail) {
    // Guard: detail was lost (refresh, state reset, etc.) — redirect home safely
    nav("home");
    return null;
  }
  if (screen === "detail" && detail) {
    const img = detail.image_urls?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";
    const demoSeller = DEMO_SELLERS[detail.seller_username];
    return (
      <Phone>
        <div className="lg-content-scroll" style={{flex:1,overflowY:"auto",paddingBottom:88,background:"#f7f6f3"}}>

          {/* ── Full-bleed image hero ── */}
          <div style={{position:"relative",height:300,overflow:"hidden",borderRadius:"0 0 28px 28px",boxShadow:"0 8px 32px rgba(0,0,0,0.14)"}}>
            <img src={img} alt={detail.title}
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
              onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
            {/* Gradient overlay */}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.28) 0%,transparent 45%,rgba(0,0,0,0.18) 100%)"}}/>
            {/* Back button */}
            <button onClick={pop} style={{position:"absolute",top:14,left:14,width:38,height:38,borderRadius:50,background:"rgba(0,0,0,0.42)",backdropFilter:"blur(8px)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <IcoBack light/>
            </button>
            {/* Save button */}
            <button onClick={e=>toggleSave(detail.id,e)} style={{position:"absolute",top:14,right:14,width:38,height:38,borderRadius:50,background:"rgba(0,0,0,0.42)",backdropFilter:"blur(8px)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
              {detail.is_saved?"❤️":"🤍"}
            </button>
            {/* Condition badge */}
            <div style={{position:"absolute",bottom:16,left:16,background:GREEN,color:"white",fontSize:10,fontWeight:800,padding:"4px 11px",borderRadius:50,letterSpacing:"0.04em"}}>
              {detail.condition}
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{padding:"20px 20px 0"}}>

            {/* Price + Title */}
            <div style={{marginBottom:4}}>
              <div style={{fontSize:32,fontWeight:900,color:"#0f0f0f",letterSpacing:"-1px",lineHeight:1}}>
                ${detail.price}
              </div>
              <div style={{fontSize:18,fontWeight:700,color:"#1a1a1a",marginTop:6,lineHeight:1.25}}>
                {detail.title}
              </div>
            </div>

            {/* Meta row */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#888",display:"flex",alignItems:"center",gap:4}}>
                📍 {detail.location}
              </span>
              {detail.time && <span style={{fontSize:11,color:"#aaa"}}>· {detail.time}</span>}
              <span style={{fontSize:11,color:"#888",background:"#f0ede8",borderRadius:50,padding:"2px 9px",fontWeight:600}}>
                {detail.category}{detail.sub ? ` · ${detail.sub}` : ""}
              </span>
            </div>

            {/* Tags */}
            {detail.tags?.length > 0 && (
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12}}>
                {detail.tags.map(t => <VintageTag key={t} label={t}/>)}
              </div>
            )}

            {/* Description */}
            {detail.description && (
              <div style={{marginTop:20,background:"white",borderRadius:18,padding:"16px 16px"}}>
                <div style={{fontSize:12,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>
                  Description
                </div>
                <div style={{fontSize:13,color:"#3d3d3d",lineHeight:1.75}}>
                  {detail.description}
                </div>
              </div>
            )}

            {/* Seller card */}
            {(() => {
              return (
                <div style={{background:"white",borderRadius:20,padding:"16px",marginTop:14,
                  boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>
                    Seller
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:46,height:46,borderRadius:50,
                      background:`linear-gradient(135deg,${GREEN},#22c55e)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      color:"white",fontWeight:900,fontSize:18,flexShrink:0}}>
                      {(detail.seller_username ||
                        (detail.seller_id === user?.id ? (profile?.username || currentUser) : null) ||
                        "U")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontWeight:800,fontSize:15,color:"#0f0f0f"}}>
                          {detail.seller_username ||
                            (detail.seller_id === user?.id ? (profile?.username || currentUser) : null) ||
                            "Seller"}
                        </span>
                        <span style={{background:"rgba(26,107,58,0.09)",color:GREEN,
                          fontSize:9,fontWeight:800,padding:"2px 7px",
                          borderRadius:50,border:"1px solid rgba(26,107,58,0.2)"}}>
                          Member
                        </span>
                      </div>
                      <div style={{fontSize:11,color:"#aaa",marginTop:2}}>
                        ⭐ {detail.rating || "4.5"} · {demoSeller ? `Joined ${demoSeller.joined}` : "Verified seller"}
                      </div>
                    </div>
                  </div>
                  {demoSeller?.bio && (
                    <div style={{fontSize:12,color:"#666",marginTop:12,lineHeight:1.65,
                      paddingTop:12,borderTop:"1px solid #f0ede8"}}>
                      {demoSeller.bio}
                    </div>
                  )}
                  {demoSeller?.location && (
                    <div style={{fontSize:11,color:"#aaa",marginTop:6}}>📍 {demoSeller.location}</div>
                  )}
                </div>
              );
            })()}

            {/* Safety notice */}
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",
              borderRadius:14,padding:"10px 14px",marginTop:14,
              display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>🛡️</span>
              <div style={{fontSize:11,color:"#92400e",lineHeight:1.55,flex:1}}>
                <strong>Stay safe:</strong> Always meet in a public place. Never pay before inspecting.{" "}
                <a href="https://www.loopgen.com.au/trust" style={{color:GREEN,fontWeight:700,textDecoration:"none"}}>Safety tips →</a>
              </div>
            </div>
            <button onClick={() => setReportModal({item:detail})}
              style={{marginTop:10,background:"none",border:"none",
                fontSize:11,color:"#9ca3af",cursor:"pointer",
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                textDecoration:"underline",padding:0}}>
              Report this listing
            </button>

            {/* ── Related Listings ── */}
            {(() => {
              const related = listings
                .filter(l => l.id !== detail.id)
                .map(l => {
                  const sharedTags = (l.tags||[]).filter(t => (detail.tags||[]).includes(t)).length;
                  const sameCategory = l.category === detail.category ? 2 : 0;
                  return { ...l, _score: sharedTags * 3 + sameCategory };
                })
                .filter(l => l._score > 0)
                .sort((a, b) => b._score - a._score)
                .slice(0, 6);

              if (!related.length) return null;
              return (
                <div style={{marginTop:20}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:12,letterSpacing:"-0.2px"}}>
                    You may also like
                  </div>
                  <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
                    {related.map(item => (
                      <ListingCard key={item.id} item={item} onTap={openDetail} onSave={toggleSave} compact/>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Sticky CTA bar ── */}
        {(() => {
          // Own listing check — works in both Supabase mode (by user.id) and demo mode (by username)
          const isOwnListing = user
            ? (detail.seller_id && detail.seller_id === user.id) ||
              (!detail.seller_id && detail.seller_username && detail.seller_username === currentUser)
            : false;
          return (
            <div style={{position:"absolute",bottom:0,left:0,right:0,
              padding:"12px 16px 28px",background:"white",
              borderTop:"1px solid #f0ede8",display:"flex",gap:9,
              boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
              <button onClick={e=>toggleSave(detail.id,e)}
                style={{width:50,height:50,borderRadius:16,
                  border:"1.5px solid #e8e5e0",background:"white",
                  fontSize:20,cursor:"pointer",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                {detail.is_saved?"❤️":"🤍"}
              </button>
              {isOwnListing ? (
                <div style={{flex:1,padding:"14px 8px",borderRadius:16,
                  border:"1.5px solid #e5e7eb",background:"#f9fafb",
                  color:"#9ca3af",fontWeight:600,fontSize:13,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  📋 Your listing
                </div>
              ) : (
                <>
                  <button onClick={() => openSellerChat(detail)}
                    style={{flex:1,padding:"14px 8px",borderRadius:16,
                      border:`2px solid ${GREEN}`,background:"white",
                      color:GREEN,fontWeight:700,fontSize:13,cursor:"pointer",
                      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    💬 Message Seller
                  </button>
                  <button onClick={() => { setOfferPrice(""); setOfferModal({item:detail}); }}
                    style={{flex:1,padding:"14px 8px",borderRadius:16,
                      border:"none",background:GREEN,color:"white",
                      fontWeight:700,fontSize:13,cursor:"pointer",
                      boxShadow:`0 6px 18px ${GREEN}44`,
                      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    {offerSent[detail.id] ? `Offer: $${offerSent[detail.id]}` : "Make Offer"}
                  </button>
                </>
              )}
            </div>
          );
        })()}
        <Toast msg={toast}/>
        <OfferModal
          modal={offerModal}
          offerPrice={offerPrice}
          setOfferPrice={setOfferPrice}
          submitting={offerSubmitting}
          onClose={() => { if (!offerSubmitting) { setOfferModal(null); setOfferPrice(""); } }}
          onSubmit={async () => {
            if (offerSubmitting) return; // block double-tap
            if (!offerPrice || isNaN(parseFloat(offerPrice)) || parseFloat(offerPrice) <= 0) {
              showToast("Enter a valid offer amount"); return;
            }
            setOfferSubmitting(true);
            if (user) {
              try {
                await dbSaveOffer({
                  listing_id: offerModal.item.id,
                  buyer_id:   user.id,
                  seller_id:  offerModal.item.seller_id || null,
                  price:      offerPrice,
                });
              } catch (e) {
                showToast("Offer couldn't be saved — please try again.");
                setOfferSubmitting(false);
                return;
              }
            }
            setOfferSent(prev => ({...prev, [offerModal.item.id]: offerPrice}));
            const item = offerModal.item;
            const price = offerPrice;
            setOfferModal(null);
            setOfferPrice("");
            showToast(`Offer of $${price} sent!`);
            const offerMsgContent = `Hi! I'd like to make an offer of $${price} for your ${item.title || "item"}. Is this price okay?`;
            await openSellerChat(item, offerMsgContent);
            setOfferSubmitting(false);
          }}
        />
        <ReportModal
          modal={reportModal}
          onClose={() => setReportModal(null)}
          onSubmit={async (reason) => {
            if (!reason) { showToast("Please select a reason"); return; }
            // DB reports.reason CHECK only allows: 'scam', 'fake', 'inappropriate'
            // Map frontend display reasons to DB-allowed values
            const reasonMap = {
              "Suspected fake item":    "fake",
              "Spam / duplicate":       "scam",
              "Misleading description": "inappropriate",
              "Wrong category":         "inappropriate",
              "Prohibited item":        "inappropriate",
              "Other":                  "inappropriate",
            };
            const dbReason = reasonMap[reason] || "inappropriate";
            try {
              await dbSaveReport({
                listing_id:  reportModal.item.id,
                reporter_id: user?.id || null,
                reason:      dbReason,
              });
              setReportModal(null);
              showToast("Report submitted. Thank you.");
            } catch {
              showToast("Report couldn't be submitted — please try again.");
            }
          }}
        />
      </Phone>
    );
  }
  // ════════════════════════════
  if (screen === "sell") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div className="lg-sell-root" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div className="lg-sell-header" style={{padding:"4px 16px 0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:"#111"}}>{editListing ? "Edit listing" : "List an item"}</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>Step {sellStep} of 3 — {["Photos & details","Description & location","Preview"][sellStep-1]}</div>
          </div>
        </div>
        {isGuest && <span style={{fontSize:11,color:"#ef4444",fontWeight:600,background:"#fef2f2",padding:"4px 8px",borderRadius:8}}>Sign in to list</span>}
      </div>
      {/* Progress */}
      <div style={{padding:"10px 16px 4px",display:"flex",gap:5,flexShrink:0}}>
        {[1,2,3].map(s => <div key={s} style={{flex:1,height:4,borderRadius:4,background:s<=sellStep?GREEN:"#e5e7eb",transition:"background 0.3s"}}/>)}
      </div>

      <div className="lg-sell-scroll" style={{flex:1,overflowY:"auto",padding:"0 20px 20px",paddingBottom:90}}>
        {sellStep===1 && (
          <>
            {/* Photo upload — with preview strip and remove buttons */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} style={{display:"none"}}/>
            {/* Main drop zone */}
            <div onClick={() => sellImages.length < 5 && fileInputRef.current?.click()}
              style={{background:"#f9fafb",borderRadius:20,height:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:sellImages.length<5?"pointer":"default",border:"2px dashed #e5e7eb",marginBottom:sellImages.length>0?10:16,position:"relative",overflow:"hidden"}}>
              {sellImages.length > 0
                ? <img src={sellImages[0]} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>
                : <>
                    <div style={{width:52,height:52,borderRadius:16,background:"white",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.08)",marginBottom:10}}><IcoCamera/></div>
                    <div style={{fontWeight:600,color:"#374151",fontSize:14}}>{uploadingImg?"Uploading…":"Add photos"}</div>
                    <div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>Tap to upload · Up to 5</div>
                  </>
              }
              {sellImages.length > 0 && (
                <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.6)",color:"white",fontSize:11,fontWeight:700,padding:"4px 9px",borderRadius:20}}>
                  {sellImages.length}/5 photo{sellImages.length>1?"s":""}
                </div>
              )}
              {uploadingImg && (
                <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"white",fontWeight:700,fontSize:13}}>Uploading…</span>
                </div>
              )}
            </div>
            {/* Thumbnail strip with remove buttons */}
            {sellImages.length > 0 && (
              <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:16,paddingBottom:4,scrollbarWidth:"none"}}>
                {sellImages.map((url, idx) => (
                  <div key={idx} style={{position:"relative",flexShrink:0,width:70,height:70,borderRadius:12,overflow:"hidden",border:idx===0?"2.5px solid #1c7c45":"2px solid #e5e7eb"}}>
                    <img src={url} alt={`Photo ${idx+1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                    {/* Primary badge */}
                    {idx===0 && (
                      <div style={{position:"absolute",bottom:2,left:0,right:0,textAlign:"center",fontSize:9,fontWeight:800,color:"white",background:"rgba(28,124,69,0.85)",padding:"1px 0",letterSpacing:"0.03em"}}>MAIN</div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const urlToRemove = sellImages[idx];
                        // FIX 8: Revoke blob URL to free browser memory
                        if (urlToRemove && urlToRemove.startsWith("blob:")) {
                          URL.revokeObjectURL(urlToRemove);
                        }
                        const newImages = sellImages.filter((_,i) => i !== idx);
                        const newFiles  = sellImageFiles.filter((_,i) => i !== idx);
                        setSellImages(newImages);
                        setSellImageFiles(newFiles);
                        setSell(f => ({...f, image_urls: f.image_urls.filter((_,i) => i !== idx)}));
                      }}
                      style={{position:"absolute",top:3,right:3,width:20,height:20,borderRadius:"50%",background:"rgba(0,0,0,0.65)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,color:"white",fontSize:13,lineHeight:1,fontWeight:700}}>
                      ×
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                {sellImages.length < 5 && (
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{flexShrink:0,width:70,height:70,borderRadius:12,border:"2px dashed #d1d5db",background:"#f9fafb",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2}}>
                    <span style={{fontSize:22,color:"#9ca3af",lineHeight:1}}>+</span>
                    <span style={{fontSize:9,color:"#9ca3af",fontWeight:600}}>Add</span>
                  </div>
                )}
              </div>
            )}
            <FInp placeholder="Title *" value={sell.title} onChange={v=>setSell(f=>({...f,title:v.slice(0,100)}))} maxLength={100}/>
            <FInp placeholder="Price (AUD $) *" type="number" value={sell.price} onChange={v=>setSell(f=>({...f,price:v}))}/>
            <FSel value={sell.category} onChange={v=>setSell(f=>({...f,category:v,sub:""}))} ph="Category *"
              opts={["","Vintage & Collectibles","Fashion","Electronics","Home","Sports","Vehicles","Pets","Tickets","Music, Books & Games","Cars & Vehicles","Baby & Kids","Boats & Jet Skis","Miscellaneous","Freebies"]}/>
            {sell.category === "Vintage & Collectibles" && (
              <FSel value={sell.sub} onChange={v=>setSell(f=>({...f,sub:v}))} ph="Subcategory"
                opts={["","Vinyl Records","DVD / Blu-ray","Retro Games","Film Cameras","Polaroid Cameras","Cassette Tapes","Vintage Clothing","Retro Electronics","Collectible Toys","Posters & Memorabilia"]}/>
            )}
            <FSel value={sell.condition} onChange={v=>setSell(f=>({...f,condition:v}))} ph="Condition *"
              opts={["","New","Like New","Good","Used","For Parts"]}/>
            {/* ── Tag selection — all categories ── */}
            {sell.category && (() => {
              // Auto-suggest tags based on title/category/condition
              const suggested = autoTagAssist(sell.title, sell.category, sell.condition)
                .filter(t => !(sell.tags||[]).includes(t));

              const toggleTag = (tag) => {
                const cur = sell.tags || [];
                if (cur.includes(tag)) {
                  setSell(f => ({...f, tags: f.tags.filter(t => t !== tag)}));
                } else {
                  if (cur.length >= MAX_TAGS) { showToast(`Max ${MAX_TAGS} tags`); return; }
                  setSell(f => ({...f, tags: [...(f.tags||[]), tag]}));
                }
              };

              const applyAll = (tags) => {
                const cur = sell.tags || [];
                const toAdd = tags.filter(t => !cur.includes(t));
                const combined = [...cur, ...toAdd].slice(0, MAX_TAGS);
                setSell(f => ({...f, tags: combined}));
              };

              const groups = [
                { label:"Style",     tags: TAG_TAXONOMY.style },
                { label:"Type",      tags: TAG_TAXONOMY.type  },
                { label:"Condition", tags: TAG_TAXONOMY.condition },
                { label:"Era",       tags: TAG_TAXONOMY.era   },
              ];

              return (
                <div style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#374151"}}>
                      Tags <span style={{color:"#9ca3af",fontWeight:500}}>({(sell.tags||[]).length}/{MAX_TAGS})</span>
                    </div>
                    {(sell.tags||[]).length > 0 && (
                      <button onClick={() => setSell(f=>({...f,tags:[]}))}
                        style={{fontSize:11,color:"#9ca3af",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Auto-suggest strip */}
                  {suggested.length > 0 && (
                    <div style={{background:"#f0fdf4",borderRadius:10,padding:"8px 10px",marginBottom:10,border:"1px solid #bbf7d0"}}>
                      <div style={{fontSize:10,fontWeight:700,color:GREEN,letterSpacing:"0.06em",marginBottom:6,textTransform:"uppercase"}}>
                        Suggested
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        {suggested.slice(0,5).map(tag => (
                          <button key={tag} onClick={() => toggleTag(tag)}
                            style={{padding:"3px 10px",borderRadius:20,border:`1.5px solid ${GREEN}`,fontSize:11,fontWeight:700,
                              cursor:"pointer",background:"white",color:GREEN,fontFamily:"inherit"}}>
                            + {tag}
                          </button>
                        ))}
                        {suggested.length > 1 && (sell.tags||[]).length + suggested.length <= MAX_TAGS && (
                          <button onClick={() => applyAll(suggested)}
                            style={{padding:"3px 10px",borderRadius:20,border:"none",fontSize:11,fontWeight:700,
                              cursor:"pointer",background:GREEN,color:"white",fontFamily:"inherit"}}>
                            Add all
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Grouped tag picker */}
                  {groups.map(({label, tags}) => (
                    <div key={label} style={{marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>
                        {label}
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {tags.map(tag => {
                          const active = (sell.tags||[]).includes(tag);
                          const c = TAG_COLORS[tag] || {bg:"#f3f4f6",text:"#374151",border:"#e5e7eb"};
                          return (
                            <button key={tag} onClick={() => toggleTag(tag)}
                              style={{padding:"4px 11px",borderRadius:50,fontSize:11,fontWeight:700,
                                cursor:"pointer",fontFamily:"inherit",transition:"all 0.12s",
                                border:`1.5px solid ${active ? c.border : "#e5e7eb"}`,
                                background: active ? c.bg : "white",
                                color: active ? c.text : "#9ca3af",
                                opacity: (!active && (sell.tags||[]).length >= MAX_TAGS) ? 0.4 : 1}}>
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {(sell.tags||[]).length === 0 && (
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>
                      Select at least 1 tag to help buyers find your item
                    </div>
                  )}
                </div>
              );
            })()}
            <GreenBtn disabled={uploadingImg} onClick={()=>{
              if (uploadingImg) return;
              if (!sell.title.trim()) { showToast("Please add a title"); return; }
              if (!sell.price || parseFloat(sell.price) <= 0) { showToast("Please add a valid price"); return; }
              if (!sell.category) { showToast("Please select a category"); return; }
              if (!sell.condition) { showToast("Please select a condition"); return; }
              if (sellImages.length === 0) { showToast("Please add at least 1 photo"); return; }
              // T6: ensure at least 1 tag; auto-fill Type+Condition if missing
              const curTags = sell.tags || [];
              const hasType = TAG_TAXONOMY.type.some(t => curTags.includes(t));
              const hasCond = TAG_TAXONOMY.condition.some(t => curTags.includes(t));
              if (!hasType || !hasCond || curTags.length === 0) {
                const auto = autoTagAssist(sell.title, sell.category, sell.condition);
                const filled = [...curTags, ...auto.filter(t => !curTags.includes(t))].slice(0, MAX_TAGS);
                if (filled.length === 0) { showToast("Please add at least 1 tag"); return; }
                setSell(f => ({...f, tags: filled}));
              }
              setSellStep(2);
            }}>{uploadingImg ? "Uploading photos…" : "Continue →"}</GreenBtn>
          </>
        )}
        {sellStep===2 && (
          <>
            <label style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:6,display:"block"}}>Description</label>
            <textarea value={sell.desc} onChange={e=>setSell(f=>({...f,desc:e.target.value.slice(0,2000)}))}
              placeholder="Describe your item…" rows={5} maxLength={2000}
              style={{width:"100%",borderRadius:14,border:"1.5px solid #e5e7eb",padding:"12px 14px",fontSize:13,resize:"none",outline:"none",marginBottom:4,color:"#374151"}}/>
            <div style={{fontSize:11,color:"#9ca3af",textAlign:"right",marginBottom:10}}>
              {(sell.desc||"").length}/2000
            </div>
            {supabase && (
              <button onClick={aiGen} style={{width:"100%",padding:"12px",borderRadius:14,marginBottom:14,background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:`1.5px solid ${GREEN}`,fontSize:13,fontWeight:700,color:GREEN,cursor:"pointer"}}>
                {aiLoading?"⏳ Generating…":"✨ Generate with AI"}
              </button>
            )}
            {/* Location — smart postcode / suburb input */}
            {(() => {
              const raw = sell.location || "";
              // Detect if input is exactly a 4-digit postcode
              const postcodeMatch = raw.match(/^\s*(\d{4})\s*$/);
              const matched = postcodeMatch ? lookupPostcode(postcodeMatch[1]) : null;
              // Show suggestion only if user hasn't already selected it
              const showSuggestion = matched && raw.trim() !== matched;
              return (
                <div style={{position:"relative",marginBottom:12}}>
                  <div style={{position:"relative"}}>
                    <input
                      type="text"
                      placeholder="📍 Suburb or postcode (e.g. 3065 or Fitzroy, VIC)"
                      value={raw}
                      onChange={e => setSell(f=>({...f,location:e.target.value}))}
                      style={{width:"100%",borderRadius:14,border:"1.5px solid #e5e7eb",
                        padding:"14px 16px",fontSize:14,outline:"none",color:"#374151",
                        fontFamily:"inherit",boxSizing:"border-box",
                        background: matched ? "#f0fdf4" : "white",
                        borderColor: matched ? GREEN : "#e5e7eb"}}
                    />
                    {matched && !showSuggestion && (
                      <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                        fontSize:11,color:GREEN,fontWeight:700,pointerEvents:"none"}}>
                        ✓
                      </div>
                    )}
                  </div>
                  {/* One-tap suggestion row */}
                  {showSuggestion && (
                    <div
                      onClick={() => setSell(f=>({...f,location:matched}))}
                      style={{background:"white",border:`1.5px solid ${GREEN}`,borderRadius:12,
                        marginTop:4,padding:"12px 16px",display:"flex",alignItems:"center",gap:8,
                        cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                      <span style={{fontSize:16}}>📍</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{matched}</div>
                        <div style={{fontSize:11,color:"#9ca3af"}}>Tap to use this suburb</div>
                      </div>
                      <span style={{fontSize:11,color:GREEN,fontWeight:700}}>Select →</span>
                    </div>
                  )}
                  {postcodeMatch && !matched && (
                    <div style={{fontSize:11,color:"#f59e0b",marginTop:4,paddingLeft:4}}>
                      ⚠️ Postcode not found — type your suburb name instead
                    </div>
                  )}
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={()=>setSellStep(1)} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,cursor:"pointer",color:"#374151"}}>← Back</button>
              <GreenBtn disabled={uploadingImg} onClick={()=>{ if (!uploadingImg) setSellStep(3); }} mt={0} style={{flex:2}}>{uploadingImg ? "Uploading photos…" : "Preview →"}</GreenBtn>
            </div>
          </>
        )}
        {sellStep===3 && (
          <>
            <div style={{background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 3px 16px rgba(0,0,0,0.09)",marginBottom:16}}>
              {sellImages.length > 0
                ? <img src={sellImages[0]} alt="preview" style={{width:"100%",height:160,objectFit:"cover"}}/>
                : <div style={{background:"#f3f4f6",height:160,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{String.fromCodePoint(0x1F4E6)}</div>
              }
              <div style={{padding:16}}>
                <div style={{fontWeight:800,fontSize:22,color:"#111"}}>{sell.price?`$${sell.price}`:"$—"}</div>
                <div style={{fontSize:16,fontWeight:600,color:"#374151"}}>{sell.title||"Untitled"}</div>
                <div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{sell.category}{sell.condition?` · ${sell.condition}`:""}</div>
                {sell.location && <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>📍 {sell.location}</div>}
                {sell.desc && <div style={{fontSize:13,color:"#6b7280",marginTop:10,lineHeight:1.65}}>{sell.desc}</div>}
              </div>
            </div>
            {isGuest && (
              <div style={{background:"#fef3c7",borderRadius:14,padding:"12px 16px",marginBottom:12,fontSize:12,color:"#92400e",fontWeight:600}}>
                ⚠️ Sign in to save your listing permanently
              </div>
            )}
            <GreenBtn onClick={handleList} disabled={loading || uploadingImg}>{loading ? "Posting…" : uploadingImg ? "Uploading photos…" : "🚀 Post Listing"}</GreenBtn>
            <button onClick={()=>setSellStep(2)} style={{width:"100%",marginTop:10,padding:"14px",borderRadius:14,border:"1.5px solid #e5e7eb",background:"white",fontWeight:600,cursor:"pointer",color:"#374151"}}>← Edit</button>
          </>
        )}
      </div>
      </div>{/* lg-sell-root */}
      <BottomNav active="sell" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  CHATS LIST
  // ════════════════════════════
  if (screen === "chats") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div className="lg-chats-root" style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
      <div style={{padding:"4px 16px 12px",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:20,fontWeight:800,color:"#111"}}>Messages</div>
        {!isGuest && (convos.length > 0 || pendingOffers.length > 0) && (
          <span style={{fontSize:12,color:"#9ca3af",fontWeight:500}}>
            {convos.length} conversation{convos.length!==1?"s":""}
            {pendingOffers.length > 0 && ` · ${pendingOffers.length} offer${pendingOffers.length!==1?"s":""}`}
          </span>
        )}
      </div>

      {/* Pending offers banner — shown to sellers with outstanding offers */}
      {!isGuest && pendingOffers.length > 0 && (
        <div style={{margin:"0 16px 12px",background:"linear-gradient(135deg,#fff7ed,#fef3c7)",border:"1.5px solid #fcd34d",borderRadius:16,padding:"12px 14px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:16}}>💰</span>
            <span style={{fontWeight:700,fontSize:13,color:"#92400e"}}>
              {pendingOffers.length} pending offer{pendingOffers.length!==1?"s":""} on your listings
            </span>
          </div>
          {pendingOffers.slice(0,3).map(o => (
            <div key={o.id} style={{background:"white",borderRadius:10,padding:"8px 10px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.listing_title}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>
                  <span style={{fontWeight:600,color:"#059669"}}>${o.price}</span>
                  {" from "}
                  <span style={{fontWeight:600}}>{o.buyer_username}</span>
                  {" · "}{timeSince(o.created_at)}
                </div>
              </div>
              <span style={{fontSize:10,fontWeight:700,background:"#fef3c7",color:"#92400e",padding:"3px 8px",borderRadius:50,flexShrink:0,marginLeft:8}}>Pending</span>
            </div>
          ))}
          {pendingOffers.length > 3 && (
            <div style={{fontSize:11,color:"#92400e",fontWeight:600,textAlign:"center",marginTop:4}}>
              +{pendingOffers.length - 3} more offer{pendingOffers.length-3!==1?"s":""}
            </div>
          )}
        </div>
      )}
      {isGuest ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",gap:16}}>
          <div style={{fontSize:52}}>{String.fromCodePoint(0x1F4AC)}</div>
          <div style={{fontWeight:800,fontSize:18,color:"#111",textAlign:"center"}}>Chat with sellers</div>
          <div style={{fontSize:14,color:"#9ca3af",textAlign:"center",lineHeight:1.6}}>Sign in to message sellers and buyers, and get notified when someone's interested in your items.</div>
          <GreenBtn onClick={()=>push("auth")} mt={4}>Sign In to Message</GreenBtn>
          <button onClick={()=>nav("explore")} style={{background:"transparent",border:"none",color:"#9ca3af",fontSize:13,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",padding:"8px"}}>Browse listings first →</button>
        </div>
      ) : (
        <div className="lg-chats-scroll" style={{flex:1,overflowY:"auto",padding:"0 16px",display:"flex",flexDirection:"column",gap:8,paddingBottom:78}}>
          {convos.length === 0 ? (
            <div style={{textAlign:"center",padding:"52px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <div style={{fontSize:48}}>{String.fromCodePoint(0x1F4ED)}</div>
              <div style={{fontWeight:700,fontSize:16,color:"#111"}}>No messages yet</div>
              <div style={{fontSize:13,color:"#9ca3af",lineHeight:1.6}}>Find something you like and tap<br/>"Message Seller" to start a chat</div>
              <button onClick={()=>nav("explore")} style={{marginTop:4,padding:"13px 24px",borderRadius:50,background:GREEN,border:"none",color:"white",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:`0 6px 18px ${GREEN}44`}}>Browse Listings</button>
            </div>
          ) : convos.map(c => (
            <div key={c.id} onClick={() => openConvo(c)}
              style={{background:"white",borderRadius:18,padding:"14px 15px",display:"flex",gap:12,alignItems:"center",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",cursor:"pointer",minHeight:70}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:18}}>
                  {(c.other_user||"U")[0].toUpperCase()}
                </div>
                {c.online && <div style={{position:"absolute",bottom:1,right:1,width:12,height:12,background:"#22c55e",borderRadius:"50%",border:"2px solid white"}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:700,fontSize:14,color:"#111"}}>{c.other_user}</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{c.last_time || c.time}</span>
                </div>
                <div style={{fontSize:11,color:GREEN,marginTop:1,fontWeight:600}}>Re: {c.listing_title || c.item}</div>
                <div style={{fontSize:12,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{c.last_message || c.last}</div>
              </div>
              {(c.unread>0) && <div style={{background:GREEN,color:"white",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{c.unread}</div>}
            </div>
          ))}
        </div>
      )}
      </div>
      <BottomNav active="chats" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  CHAT
  // ════════════════════════════
  if (screen === "chat") return (
    <ChatScreen
      sellerName={chatContext?.sellerName || "Seller"}
      listingTitle={chatContext?.listingTitle || ""}
      messages={localChatStore.current[chatContext?.id] || []}
      onSend={async (msg) => {
        // 1. Show immediately in local store
        addMessageToStore(chatContext?.id, msg);
        // 2. Persist to Supabase if we have a real conversation
        if (supabase && user && chatContext?.convId) {
          try {
            await dbSendMessage(chatContext.convId, user.id, msg.content);
          } catch (e) {
            console.error("[LoopGen] Message save failed:", e);
            showToast("Message couldn't save — check connection");
          }
        }
      }}
      onBack={pop}
    />
  );

    // ════════════════════════════
  //  PROFILE
  // ════════════════════════════
  if (screen === "profile") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:78}}>
        {/* Profile hero */}
        <div style={{background:`linear-gradient(160deg,#f0fdf4,#dcfce7)`,padding:"20px 20px 24px",textAlign:"center",borderBottom:"1px solid #e8f5ee"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${GREEN},#22c55e)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:"white",fontSize:34,fontWeight:800,boxShadow:`0 6px 20px ${GREEN}44`}}>
            {isGuest ? "G" : currentUser[0].toUpperCase()}
          </div>
          <div style={{fontWeight:800,fontSize:18,color:"#111"}}>{isGuest ? "Guest User" : currentUser}</div>
          {!isGuest && <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{user?.email}</div>}
          {!isGuest && (
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"4px 12px",marginTop:8}}>
              <span style={{fontSize:11}}>✅</span>
              <span style={{fontSize:11,fontWeight:700,color:GREEN}}>Verified Member</span>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:18}}>
            {[
              [isGuest?"—":String(userListings.filter(l=>l.status==="active").length), "Listings"],
              [isGuest?"—":String(userListings.filter(l=>l.status==="sold").length),   "Sold"],
            ].map(([v,l]) => (
              <div key={l} style={{cursor:l==="Listings"&&!isGuest?"pointer":"default"}} onClick={l==="Listings"&&!isGuest?()=>push("my-listings"):undefined}>
                <div style={{fontWeight:800,fontSize:20,color:"#111"}}>{v}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:3}}>
          {isGuest ? (
            <>
              <GreenBtn onClick={()=>push("auth")} mt={0}>Sign In or Register</GreenBtn>
              <div style={{textAlign:"center",marginTop:14,fontSize:13,color:"#9ca3af",lineHeight:1.6}}>Sign in to manage listings,<br/>save items, and chat with sellers</div>
            </>
          ) : (
            [
              ["My Listings",      "📦", ()=>push("my-listings")],
              ["Saved Items",      "❤️", ()=>push("saved-items")],
              ["Account Settings", "⚙️", ()=>push("settings")],
              ["Reviews",          "⭐", ()=>showToast("Reviews coming after beta 🌟")],
              ["Help & Support",   "💬", ()=>showToast("Support: support@loopgen.com.au")],
              ["Sign Out",         "🚪", handleSignOut],
            ].map(([label, icon, action], i) => (
              <div key={label} onClick={action}
                style={{padding:"16px",background:"white",borderRadius:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:i===4?10:0,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",minHeight:54}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>{icon}</span>
                  <span style={{fontWeight:600,fontSize:14,color:label==="Sign Out"?"#ef4444":"#111"}}>{label}</span>
                </div>
                {label!=="Sign Out"&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>}
              </div>
            ))
          )}
        </div>

        {/* Trust footer on profile */}
        <div style={{margin:"8px 16px 16px",padding:"14px",background:"#f8f9fa",borderRadius:14,border:"1px solid #f0f0f0"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <LoopGenLogo height={22} />
          </div>
          <div style={{fontSize:11,color:"#9ca3af",textAlign:"center",lineHeight:1.6}}>
            LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620)<br/>
            <a href="https://www.loopgen.com.au/terms"   style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Terms</a>
            {" · "}
            <a href="https://www.loopgen.com.au/privacy" style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Privacy</a>
            {" · "}
            <a href="https://www.loopgen.com.au/trust"   style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Safety</a>
            {" · "}
            <a href="mailto:support@loopgen.com.au" style={{color:GREEN,fontWeight:600,textDecoration:"none"}}>Contact</a>
          </div>
        </div>
      </div>
      <BottomNav active="profile" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <ConfirmModal confirm={confirm} onCancel={()=>setConfirm(null)}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  MY LISTINGS
  // ════════════════════════════
  if (screen === "my-listings") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
        <div style={{fontSize:18,fontWeight:800,color:"#111"}}>My Listings</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px",paddingBottom:88}}>
        {userListings.length === 0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:60,gap:14}}>
            <div style={{fontSize:44}}>{String.fromCodePoint(0x1F4E6)}</div>
            <div style={{fontWeight:700,fontSize:16,color:"#111"}}>No listings yet</div>
            <div style={{fontSize:13,color:"#9ca3af",textAlign:"center"}}>Tap the + button to sell your first item</div>
            <GreenBtn onClick={()=>nav("sell")} mt={8} style={{width:"auto",padding:"13px 28px"}}>Start Selling</GreenBtn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {userListings.map(item => {
              const img = item.image_urls?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";
              const isSold = item.status === "sold";
              return (
                <div key={item.id} style={{background:"white",borderRadius:22,overflow:"hidden",boxShadow:"0 3px 14px rgba(0,0,0,0.08)",display:"flex",opacity:isSold?0.75:1}}>
                  <div style={{position:"relative",flexShrink:0,width:100,height:100}}>
                    <img src={img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}
                      onError={e=>{e.target.onerror=null;e.target.src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80"}}/>
                    {isSold && (
                      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{color:"white",fontWeight:800,fontSize:11,background:"#ef4444",padding:"3px 8px",borderRadius:8}}>SOLD</span>
                      </div>
                    )}
                  </div>
                  <div style={{padding:"12px 14px",flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontWeight:800,fontSize:16,color:"#111"}}>${item.price}</div>
                        <div style={{fontSize:13,fontWeight:600,color:"#374151",marginTop:2}}>{item.title}</div>
                        <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{item.condition} · {timeSince(item.created_at)}</div>
                      </div>
                      {isSold && <span style={{fontSize:10,fontWeight:700,color:"#ef4444",background:"#fef2f2",padding:"3px 8px",borderRadius:8,flexShrink:0}}>SOLD</span>}
                    </div>
                    {!isSold && (
                      <div style={{display:"flex",gap:7,marginTop:10}}>
                        <button onClick={()=>handleMarkSold(item.id)}
                          style={{flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${GREEN}`,background:"white",color:GREEN,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          Mark Sold
                        </button>
                        {/* FIX 7: Edit listing button */}
                        <button onClick={()=>{
                          // Pre-fill sell form with existing listing data
                          setEditListing(item);
                          setSell({
                            title: item.title || "",
                            price: String(item.price || ""),
                            category: item.category || "",
                            sub: item.sub || "",
                            condition: item.condition || "",
                            desc: item.description || "",
                            location: item.location || "",
                            image_urls: item.image_urls || [],
                            tags: item.tags || [],
                          });
                          setSellImages(item.image_urls || []);
                          setSellImageFiles([]);
                          setSellStep(1);
                          push("sell");
                        }}
                          style={{flex:1,padding:"8px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"white",color:"#374151",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                          Edit
                        </button>
                        <button onClick={()=>{setDetail(item);push("detail");}}
                          style={{flex:1,padding:"8px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"white",color:"#374151",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                          View
                        </button>
                        <button onClick={()=>handleDeleteListing(item.id)}
                          style={{padding:"8px 12px",borderRadius:10,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav active="profile" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <ConfirmModal confirm={confirm} onCancel={()=>setConfirm(null)}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  SAVED ITEMS
  // ════════════════════════════
  if (screen === "saved-items") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
        <div style={{fontSize:18,fontWeight:800,color:"#111"}}>Saved Items</div>
        {savedListings.length > 0 && <span style={{marginLeft:"auto",fontSize:12,color:"#9ca3af",fontWeight:500}}>{savedListings.length} item{savedListings.length!==1?"s":""}</span>}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px",paddingBottom:88}}>
        {savedListings.length === 0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:60,gap:14}}>
            <div style={{fontSize:44}}>{String.fromCodePoint(0x1FA76)}</div>
            <div style={{fontWeight:700,fontSize:16,color:"#111"}}>Nothing saved yet</div>
            <div style={{fontSize:13,color:"#9ca3af",textAlign:"center"}}>Tap the heart on any listing to save it</div>
            <GreenBtn onClick={()=>nav("explore")} mt={8} style={{width:"auto",padding:"13px 28px"}}>Browse Listings</GreenBtn>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {savedListings.map(item => (
              <div key={item.id} style={{position:"relative"}}>
                <ListingCard
                  item={{...item, is_saved:true, time: item.time || timeSince(item.created_at)}}
                  onTap={openDetail}
                  onSave={async (id, e) => {
                    e?.stopPropagation();
                    setSavedListings(sl => sl.filter(l => l.id !== id));
                    setListings(ls => ls.map(l => l.id===id ? {...l, is_saved:false} : l));
                    showToast("Removed from saved");
                    if (user) await dbToggleSave(id, user.id, true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="profile" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <Toast msg={toast}/>
    </Phone>
  );

  // ════════════════════════════
  //  ACCOUNT SETTINGS
  // ════════════════════════════
  if (screen === "settings") return (
    <Phone>
      <StatusBar/>
      <DemoBanner/>
      <div style={{padding:"4px 20px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div onClick={pop} style={{cursor:"pointer"}}><IcoBack/></div>
        <div style={{fontSize:18,fontWeight:800,color:"#111"}}>Account Settings</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 20px",paddingBottom:88,display:"flex",flexDirection:"column",gap:16}}>
        {/* Account info + username edit */}
        <div style={{background:"#f8f9fa",borderRadius:18,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Account</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>

            {/* Username row — editable */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#6b7280"}}>Username</span>
                {!editingUsername && (
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{currentUser}</span>
                    <button onClick={()=>{setUsernameInput(currentUser);setEditingUsername(true);}}
                      style={{fontSize:11,color:GREEN,fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>
                      Edit
                    </button>
                  </div>
                )}
              </div>
              {editingUsername && (
                <div style={{marginTop:10}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input
                      value={usernameInput}
                      onChange={e=>setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_.]/g,"").slice(0,30))}
                      placeholder="Enter username"
                      maxLength={30}
                      style={{flex:1,borderRadius:10,border:`1.5px solid ${GREEN}`,padding:"10px 12px",
                        fontSize:14,outline:"none",fontFamily:"inherit",color:"#111"}}
                    />
                    <button
                      disabled={usernameLoading || !usernameInput.trim() || usernameInput.trim().length < 3}
                      onClick={async()=>{
                        const rawName = usernameInput.trim();
                        if (rawName.length < 3) { showToast("Username must be at least 3 characters"); return; }
                        const newName = normalizeUsername(rawName);
                        if (!newName || newName.length < 3) { showToast("Username can only contain letters, numbers, _ and ."); return; }
                        setUsernameLoading(true);
                        try {
                          // Check uniqueness before saving
                          if (supabase) {
                            const { data: taken } = await supabase
                              .from("profiles").select("id").eq("username", newName).neq("id", user.id).maybeSingle();
                            if (taken) { showToast(`"${newName}" is already taken`); return; }
                          }
                          await dbUpsertProfile(user.id, { username: newName });
                          setProfile(p => ({...p, username: newName}));
                          setEditingUsername(false);
                          showToast("✅ Username updated!");
                        } catch(e) { showToast("Failed: " + e.message); }
                        setUsernameLoading(false);
                      }}
                      style={{padding:"10px 14px",borderRadius:10,background:GREEN,color:"white",
                        border:"none",fontWeight:700,fontSize:13,cursor:"pointer",
                        fontFamily:"inherit",opacity:usernameLoading?0.6:1}}>
                      {usernameLoading?"…":"Save"}
                    </button>
                    <button onClick={()=>setEditingUsername(false)}
                      style={{padding:"10px 12px",borderRadius:10,border:"1.5px solid #e5e7eb",
                        background:"white",color:"#6b7280",fontWeight:600,fontSize:13,
                        cursor:"pointer",fontFamily:"inherit"}}>
                      Cancel
                    </button>
                  </div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:5,paddingLeft:2}}>
                    3–30 chars · letters, numbers, _ and . only
                  </div>
                </div>
              )}
            </div>

            <div style={{height:1,background:"#f0f0f0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"#6b7280"}}>Email</span>
              <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{user?.email}</span>
            </div>
            <div style={{height:1,background:"#f0f0f0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"#6b7280"}}>Member since</span>
              <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-AU",{month:"short",year:"numeric"}) : "—"}</span>
            </div>
          </div>
        </div>

        {/* Notifications — post-beta stub */}
        <div style={{background:"#f8f9fa",borderRadius:18,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Notifications</div>
          {[["New messages","💬",true],["Listing activity","📦",true],["Promotions","🎉",false]].map(([label,icon,def],i,arr) => (
            <div key={label}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span>{icon}</span>
                  <span style={{fontSize:13,color:"#374151"}}>{label}</span>
                </div>
                <span style={{fontSize:10,fontWeight:600,color:"#9ca3af",background:"#f0f0f0",padding:"3px 8px",borderRadius:8}}>Coming soon</span>
              </div>
              {i<arr.length-1&&<div style={{height:1,background:"#f0f0f0",margin:"6px 0"}}/>}
            </div>
          ))}
        </div>

        {/* Legal & Safety */}
        <div style={{background:"#f8f9fa",borderRadius:18,padding:"16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Legal &amp; Safety</div>
          {[
            ["Terms of Service",    "📄", ()=>{ window.location.href="https://www.loopgen.com.au/terms"; }],
            ["Privacy Policy",      "🔒", ()=>{ window.location.href="https://www.loopgen.com.au/privacy"; }],
            ["Community Guidelines","🤝", ()=>{ window.location.href="https://www.loopgen.com.au/trust"; }],
            ["Safety Tips",         "🛡️", ()=>{ window.location.href="https://www.loopgen.com.au/trust"; }],
            ["Contact Support",     "💬", ()=>{ window.location.href="mailto:support@loopgen.com.au"; }],
          ].map(([label,icon,action],i,arr) => (
            <div key={label}>
              <div onClick={action} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{icon}</span>
                  <span style={{fontSize:13,color:"#374151"}}>{label}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              {i<arr.length-1&&<div style={{height:1,background:"#f0f0f0"}}/>}
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div style={{background:"#fff5f5",borderRadius:18,padding:"16px",border:"1px solid #fecaca"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#ef4444",textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Danger Zone</div>
          <div onClick={handleSignOut}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",cursor:"pointer"}}>
            <span style={{fontSize:18}}>🚪</span>
            <span style={{fontSize:14,fontWeight:600,color:"#ef4444"}}>Sign Out</span>
          </div>
          <div style={{height:1,background:"#fecaca",margin:"4px 0"}}/>
          <div onClick={()=>setConfirm({
              msg:"Delete your account? All listings and messages will be lost forever.",
              onConfirm: async () => {
                // Supabase doesn't expose deleteUser from client — direct users to support
                setConfirm(null);
                showToast("Contact support@loopgen.com.au to delete your account");
              }
            })}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",cursor:"pointer"}}>
            <span style={{fontSize:18}}>🗑️</span>
            <span style={{fontSize:14,fontWeight:600,color:"#ef4444"}}>Delete Account</span>
          </div>
        </div>

        <div style={{fontSize:11,color:"#c4c9d4",textAlign:"center",paddingBottom:8,lineHeight:1.8}}>
          <LoopGenLogo height={22} style={{margin:"0 auto 8px"}} />
          LoopGen Beta v0.2.0 · <a href="mailto:support@loopgen.com.au" style={{color:"#9ca3af",textDecoration:"none"}}>support@loopgen.com.au</a><br/>
          LoopGen is operated by NexaraX Pty Ltd (ACN: 696 134 620 / ABN: 43 696 134 620)
        </div>
      </div>
      <BottomNav active="profile" onNav={nav} msgCount={convos.filter(c => c.last_message && c.last_sender_id && c.last_sender_id !== user?.id).length} offerCount={pendingOffers.length}/>
      <ConfirmModal confirm={confirm} onCancel={()=>setConfirm(null)}/>
      <Toast msg={toast}/>
    </Phone>
  );

  return null;
}

// FIX 16: Exported wrapper — ErrorBoundary catches any render crash in LoopGenAppInner
export default function LoopGenApp() {
  return (
    <AppErrorBoundary>
      <LoopGenAppInner />
    </AppErrorBoundary>
  );
}
