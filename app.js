const fish = [
  {name:'翘嘴鲌',group:'淡水',habitat:'湖库 · 江河开阔水面',depth:['surface','mid'],lures:['minnow','pencil','vib','spoon'],tip:'追逐小鱼，留意炸水、明水与洄水湾；中上层搜索。'},
  {name:'大口黑鲈（加州鲈）',group:'淡水',habitat:'湖库 · 池塘 · 水草边',depth:['shallow','mid','bottom'],lures:['crank','soft','spinnerbait','jerkbait','frog'],tip:'覆盖水草、岸边、倒木与落差；按结构选择防挂钓组。'},
  {name:'鳜鱼',group:'淡水',habitat:'江河 · 水库 · 石结构',depth:['bottom','mid'],lures:['soft','jighead','vib','minnow'],tip:'伏击型鱼，重点搜石坎、桥墩、乱石底与深浅交界。'},
  {name:'乌鳢（黑鱼）',group:'淡水',habitat:'池塘 · 湖库浅滩水草区',depth:['surface','shallow'],lures:['frog','soft','buzzbait'],tip:'暖季常巡水草与障碍边；雷蛙贴草洞、草边慢搜。'},
  {name:'马口鱼',group:'淡水',habitat:'溪流 · 山涧浅滩',depth:['surface','shallow'],lures:['spoon','minnow','spinner'],tip:'逆流抛投或横切水流，轻饵快速搜索浅滩与流边。'},
  {name:'宽鳍鱲（溪哥）',group:'淡水',habitat:'溪流 · 山涧',depth:['surface','shallow'],lures:['minnow','spoon','spinner'],tip:'观察水面昆虫与小鱼，使用轻量小型拟饵顺流控线。'},
  {name:'红鳍原鲌（青梢）',group:'淡水',habitat:'湖库 · 江河',depth:['surface','mid'],lures:['minnow','spoon','vib'],tip:'常在中上层追饵鱼，可用小米诺或亮片搜索开阔水面。'},
  {name:'蒙古鲌',group:'淡水',habitat:'湖库 · 江河',depth:['surface','mid'],lures:['minnow','vib','spoon'],tip:'掠食小鱼，水面有追食时先试米诺和小型金属饵。'},
  {name:'赤眼鳟（红眼）',group:'淡水',habitat:'东部河湖 · 江河缓流 · 水库',depth:['surface','shallow','mid'],lures:['minnow','spoon','spinner','micro'],tip:'东部多水系可见的杂食性鱼；试小米诺、轻亮片或微物，沿缓流、浅滩与饵鱼活动处轻收。'},
  {name:'鲶鱼',group:'淡水',habitat:'江河 · 湖库 · 夜间近岸',depth:['bottom','deep'],lures:['soft','jighead','vib','spinner'],tip:'常贴底或沿结构活动；低光时可用有振动的饵慢速搜索。'},
  {name:'黄颡鱼',group:'淡水',habitat:'江河缓流 · 湖库近底',depth:['bottom'],lures:['soft','jighead'],tip:'主要贴底摄食，轻铅软虫沿石缝、岸坎底部慢拖。'},
  {name:'鳡鱼',group:'淡水',habitat:'大江大河 · 水库开阔水面',depth:['surface','mid'],lures:['minnow','pencil','spoon','vib'],tip:'大型掠食鱼，追饵时可用较大米诺或铁板远投搜索。'},
  {name:'白条（䱗）',group:'淡水',habitat:'江河 · 湖库表层',depth:['surface','shallow'],lures:['spoon','minnow','spinner'],tip:'小型饵鱼，使用小尺寸亮片、米诺，轻装备更易操控。'},
  {name:'罗非鱼',group:'淡水',habitat:'南方池塘 · 缓流水域',depth:['shallow','mid'],lures:['soft','jighead','micro'],tip:'暖水季活性较高；小软虫或微物在岸边结构附近慢跳。'},
  {name:'月鳢（七星鱼）',group:'淡水',habitat:'南方池塘 · 沟渠 · 水草区',depth:['shallow','mid'],lures:['soft','frog','minnow'],tip:'常在浅水障碍和水草附近活动，可用小软饵贴边慢搜。'},
  {name:'狗鱼',group:'淡水',habitat:'东北湖泊 · 江河浅湾',depth:['shallow','mid'],lures:['minnow','spinnerbait','spoon','jerkbait'],tip:'伏击性强，草边和湾区可用较大拟饵；注意防咬前导。'},
  {name:'白斑狗鱼（新疆）',group:'淡水',habitat:'新疆额尔齐斯河流域 · 冷水湖河',depth:['shallow','mid','deep'],lures:['minnow','spoon','jerkbait','vib'],tip:'新疆地域性冷水掠食鱼，可用较大米诺或亮片搜索；先确认当地开放水域和垂钓规定。'},
  {name:'梭鲈（狗鱼鲈）',group:'淡水',habitat:'北方湖库 · 深水结构',depth:['deep','bottom'],lures:['soft','jighead','vib','jerkbait'],tip:'常在深水坎、河槽与硬底附近，软饵跳底或沉水米诺搜索。'},
  {name:'河鲈',group:'淡水',habitat:'北方湖泊 · 水库',depth:['shallow','mid'],lures:['minnow','spoon','soft','vib'],tip:'小型鱼群可能聚集，微型米诺、亮片或软饵可分层搜索。'},
  {name:'虹鳟',group:'淡水',habitat:'冷水溪流 · 管理型水域',depth:['surface','mid'],lures:['spoon','minnow','spinner'],tip:'清凉水域可试小亮片和小米诺；尊重管理水域的钓获规定。'},
  {name:'鳟鱼（褐鳟等）',group:'淡水',habitat:'冷水溪流 · 水库',depth:['surface','mid'],lures:['spoon','minnow','spinner'],tip:'观察水温和流速，轻小拟饵沿流缝与深浅交界漂送。'},
  {name:'鲈鱼（海鲈）',group:'海水',habitat:'河口 · 岸线 · 礁石',depth:['surface','shallow','mid'],lures:['minnow','pencil','soft','vib'],tip:'关注潮汐、流线和饵鱼；从表层到中层分层搜索。'},
  {name:'黑鲷',group:'海水',habitat:'河口 · 岩礁 · 防波堤',depth:['bottom','mid'],lures:['soft','jighead','crank'],tip:'常沿底部结构觅食，可试小软虫贴底缓慢拖动。'},
  {name:'石斑鱼',group:'海水',habitat:'礁区 · 岩礁 · 近岸结构',depth:['bottom','deep'],lures:['soft','jighead','metaljig'],tip:'藏身结构区，软饵或铁板贴近结构垂直搜索，注意强力控鱼。'},
  {name:'鲹类（竹荚鱼等）',group:'海水',habitat:'港湾 · 岸边 · 近海',depth:['surface','mid'],lures:['micro','spoon','metaljig'],tip:'鱼群靠岸时用微物或小型金属饵快速搜索水层。'},
  {name:'鲣鱼',group:'海水',habitat:'近海 · 外海饵鱼群',depth:['surface','mid'],lures:['metaljig','pencil','minnow'],tip:'追饵时远投金属饵或沉水铅笔，快速收线并注意安全。'},
  {name:'马鲛（鲅鱼）',group:'海水',habitat:'近海 · 船钓与岸抛',depth:['surface','mid'],lures:['metaljig','minnow','spoon'],tip:'高速掠食鱼，可用远投铁板快速搜索；配防齿前导。'},
  {name:'带鱼',group:'海水',habitat:'近海 · 港湾 · 船钓',depth:['mid','deep'],lures:['metaljig','spoon'],tip:'傍晚夜间可能上浮，金属饵分层搜索并配置防切线前导。'},
  {name:'黄鳍鲷',group:'海水',habitat:'河口 · 岩岸 · 港湾',depth:['bottom','mid'],lures:['soft','jighead','crank'],tip:'沿底部石缝和结构边缘操作小软饵，缓慢探底。'},
  {name:'鲻鱼',group:'海水',habitat:'河口 · 港湾 · 咸淡水',depth:['surface','mid'],lures:['micro','soft'],tip:'主要摄食方式并非典型掠食；追逐小鱼时才适合尝试微型拟饵。'},
  {name:'鲷类（真鲷等）',group:'海水',habitat:'近岸礁区 · 船钓',depth:['bottom','deep'],lures:['metaljig','soft','jighead'],tip:'根据流速和水深选铁板或软饵贴近底层搜索。'},
  {name:'六线鱼（黄鱼）',group:'海水',habitat:'北方岩礁 · 防波堤',depth:['bottom'],lures:['soft','jighead'],tip:'底栖鱼，软饵沿礁石底部小跳慢拖，注意挂底与断线。'}
];

// 常见路亚目标鱼的区域标签：反映常见水系或钓场情况，不代表完整天然分布边界。
const fishRegions = {
 '翘嘴鲌':'both','大口黑鲈（加州鲈）':'both','鳜鱼':'south','乌鳢（黑鱼）':'both',
 '马口鱼':'both','宽鳍鱲（溪哥）':'both','红鳍原鲌（青梢）':'both','蒙古鲌':'north','赤眼鳟（红眼）':'both',
 '鲶鱼':'both','黄颡鱼':'both','鳡鱼':'south','白条（䱗）':'both','罗非鱼':'south',
 '月鳢（七星鱼）':'south','狗鱼':'north','白斑狗鱼（新疆）':'north','梭鲈（狗鱼鲈）':'north','河鲈':'north',
 '虹鳟':'cold','鳟鱼（褐鳟等）':'cold','鲈鱼（海鲈）':'coast','黑鲷':'coast',
 '石斑鱼':'coast','鲹类（竹荚鱼等）':'coast','鲣鱼':'coast','马鲛（鲅鱼）':'coast',
 '带鱼':'coast','黄鳍鲷':'coast','鲻鱼':'coast','鲷类（真鲷等）':'coast','六线鱼（黄鱼）':'coast'
};
const fishRegionNames={south:'南方常见',north:'北方常见',both:'南北均有',cold:'冷水 / 管理水域',coast:'海水 / 河口'};

const lures = [
 {id:'minnow',name:'米诺',en:'MINNOW',icon:'◢',depth:['shallow','mid'],waters:['lake','river','coast','stream'],fish:['翘嘴鲌','大口黑鲈（加州鲈）','鳜鱼','马口鱼','赤眼鳟（红眼）','鲈鱼（海鲈）'],method:'匀速收线起步；无口时试“抽两下、停一拍”，悬停时留意追咬。',desc:'仿小鱼的硬饵，选浮水、悬停或沉水款控制水层。',color:'银白 / 透明',season:['spring','autumn']},
 {id:'jerkbait',name:'悬停米诺',en:'SUSPENDING JERKBAIT',icon:'⌁',depth:['shallow','mid'],waters:['lake','pond','coast'],fish:['大口黑鲈（加州鲈）','狗鱼','梭鲈（狗鱼鲈）'],method:'先收线到目标层，再短抽停顿；冷水或鱼追不咬时延长停顿。',desc:'抽停型鱼形硬饵，悬停时间和深度依型号而异。',color:'自然小鱼色',season:['spring','winter']},
 {id:'pencil',name:'铅笔',en:'TOPWATER PENCIL',icon:'〰',depth:['surface'],waters:['lake','river','coast'],fish:['翘嘴鲌','乌鳢（黑鱼）','鲈鱼（海鲈）','鳡鱼'],method:'连续轻抽让饵左右摆动；鱼跟不咬时放慢节奏并加停顿。',desc:'水面之字形搜索饵，适合开阔水面与追食窗口。',color:'自然 / 高对比',season:['summer','autumn']},
 {id:'popper',name:'波爬 / 波扒',en:'POPPER',icon:'◉',depth:['surface'],waters:['lake','pond','coast'],fish:['大口黑鲈（加州鲈）','翘嘴鲌'],method:'短促点抽制造水花，停一两秒观察；风浪大时效果会受影响。',desc:'杯口造水声与水花，适合水面有鱼但需要停留诱鱼时。',color:'白色 / 仿饵鱼',season:['summer']},
 {id:'frog',name:'雷蛙',en:'HOLLOW-BODY FROG',icon:'♧',depth:['surface','shallow'],waters:['lake','pond'],fish:['乌鳢（黑鱼）','大口黑鲈（加州鲈）'],method:'沿草边、草洞慢走；炸水后稍等线绷紧再扬竿。',desc:'浮水防挂饵，适合水草覆盖和表层障碍。',color:'蛙色 / 黑色',season:['summer']},
 {id:'crank',name:'摇滚小胖子',en:'CRANKBAIT',icon:'◒',depth:['shallow','mid','deep'],waters:['lake','pond','river'],fish:['大口黑鲈（加州鲈）','黑鲷'],method:'稳定收线让舌板下潜，尽量擦过石底或障碍后继续收线。',desc:'舌板控制下潜，依型号可覆盖浅到深层。',color:'浑水用亮色；清水用自然色',season:['spring','autumn']},
 {id:'vib',name:'VIB / 颤泳饵',en:'LIPLESS CRANKBAIT',icon:'⌇',depth:['mid','deep','bottom'],waters:['lake','river','coast'],fish:['翘嘴鲌','鳜鱼','鳡鱼','鲶鱼'],method:'远投后数秒下沉，匀收或小幅提竿；注意水草和底部挂钩。',desc:'沉水振动型硬饵，抛投搜索范围大，能按倒数控制水层。',color:'金属 / 自然鱼色',season:['spring','autumn']},
 {id:'spoon',name:'勺型亮片',en:'SPOON',icon:'◖',depth:['shallow','mid'],waters:['river','stream','lake','coast'],fish:['马口鱼','宽鳍鱲（溪哥）','赤眼鳟（红眼）','虹鳟','河鲈'],method:'上游或横流抛投，控制收线速度让亮片稳定摆动。',desc:'反光摆动的金属拟饵，轻量款适合溪流和小型鱼。',color:'晴天银色；阴天金色',season:['spring','autumn']},
 {id:'spinner',name:'旋转亮片',en:'INLINE SPINNER',icon:'✳',depth:['shallow','mid'],waters:['stream','river','lake'],fish:['马口鱼','宽鳍鱲（溪哥）','赤眼鳟（红眼）','虹鳟'],method:'均速收线维持叶片转动，沿流边或水草外缘扫过。',desc:'叶片闪光并产生振动，小鱼和流水环境的搜索饵。',color:'银 / 金',season:['spring','summer']},
 {id:'spinnerbait',name:'复合旋转亮片',en:'SPINNERBAIT',icon:'✣',depth:['shallow','mid'],waters:['lake','pond'],fish:['大口黑鲈（加州鲈）','狗鱼'],method:'贴水草边匀收，经过障碍时稍放慢；可用竿尖改变泳层。',desc:'单钩防挂结构，适合水草边和障碍区搜索。',color:'白色 / 查特鲁斯',season:['spring','autumn']},
 {id:'buzzbait',name:'蜂鸣饵',en:'BUZZBAIT',icon:'✴',depth:['surface'],waters:['lake','pond'],fish:['乌鳢（黑鱼）','大口黑鲈（加州鲈）'],method:'落水后快速起动保持叶片出水，沿草边持续搜索。',desc:'表层噪音搜索饵，适合鱼活跃并能追击水面的时段。',color:'黑 / 白',season:['summer']},
 {id:'soft',name:'软虫 / 软饵',en:'SOFT PLASTIC',icon:'∿',depth:['mid','deep','bottom'],waters:['lake','river','pond','coast'],fish:['鳜鱼','大口黑鲈（加州鲈）','鲶鱼','黑鲷','石斑鱼'],method:'沉底后轻抖、拖动或小跳；让软饵贴近结构并保持触底感。',desc:'形态和尺寸多样，可搭配多种钩型与铅重。',color:'清水自然色；浑水高对比',season:['spring','summer','autumn','winter']},
 {id:'jighead',name:'铅头钩 + 软饵',en:'JIGHEAD',icon:'⊙',depth:['mid','deep','bottom'],waters:['river','lake','coast'],fish:['鳜鱼','黄颡鱼','鲶鱼','石斑鱼'],method:'抛投沉底后扬竿小跳，慢收并保持触底；重铅应对急流和深水。',desc:'结构简单、搜索范围广的通用软饵组合。',color:'自然小鱼 / 虾色',season:['spring','autumn']},
 {id:'metaljig',name:'铁板 / 金属饵',en:'METAL JIG',icon:'◆',depth:['mid','deep','bottom'],waters:['coast','river','lake'],fish:['鲣鱼','马鲛（鲅鱼）','带鱼','鲷类（真鲷等）','石斑鱼'],method:'抛投后数秒控制泳层，快速收或抽停；船钓可垂直提放。',desc:'高比重远投或垂直搜索，重量按风、流和水深选。',color:'银色 / 镭射',season:['summer','autumn']},
 {id:'micro',name:'微物饵',en:'MICRO LURE',icon:'·',depth:['surface','shallow','mid'],waters:['stream','river','pond','coast'],fish:['马口鱼','罗非鱼','白条（䱗）','赤眼鳟（红眼）','鲹类（竹荚鱼等）'],method:'轻抛、慢收，必要时加小铅头控制下沉；避免过粗线影响泳姿。',desc:'小尺寸亮片、软饵和米诺的统称，适合轻量装备。',color:'透明 / 银色',season:['spring','summer']},
 {id:'blade',name:'平振亮片',en:'BLADE BAIT',icon:'⌁',depth:['mid','deep','bottom'],waters:['lake','river'],fish:['翘嘴鲌','鳜鱼','鲶鱼'],method:'提竿振动、放线下沉，分层搜索；收紧余线避免触底挂底。',desc:'薄金属振动饵，适合深水和低温时慢速搜索。',color:'银 / 金',season:['autumn','winter']},
 {id:'swimbait',name:'泳饵',en:'SWIMBAIT',icon:'≈',depth:['shallow','mid','deep'],waters:['lake','river','coast'],fish:['大口黑鲈（加州鲈）','鳡鱼','狗鱼','鲈鱼（海鲈）'],method:'匀速慢收为主，间隔短暂停顿；控制速度让饵经过目标层。',desc:'软硬材质皆有，体型与泳层跨度大，适合锁定较大掠食鱼。',color:'匹配当地饵鱼',season:['summer','autumn']},
 {id:'tailspin',name:'旋尾亮片',en:'TAIL SPINNER',icon:'✧',depth:['mid','deep'],waters:['lake','river'],fish:['翘嘴鲌','红鳍原鲌（青梢）','鳡鱼'],method:'远投沉到目标层后匀速收线，也可短抽停顿。',desc:'小体积高比重，兼顾远投、下沉与尾部闪光振动。',color:'银色 / 镭射',season:['autumn','winter']},
 {id:'spintail',name:'旋尾软饵',en:'PADDLE TAIL',icon:'∽',depth:['shallow','mid','deep'],waters:['lake','river','coast'],fish:['鲈鱼（海鲈）','鳜鱼','大口黑鲈（加州鲈）'],method:'匀速收线带动尾部摆动，或沿底层慢拖；按铅头调节下沉。',desc:'尾部产生摆动，适合覆盖不同水层和搜索饵鱼。',color:'银白 / 珍珠白',season:['summer','autumn']},
 {id:'wacky',name:'Wacky / 无铅虫',en:'WACKY RIG',icon:'∩',depth:['shallow','mid'],waters:['lake','pond'],fish:['大口黑鲈（加州鲈）'],method:'无铅或轻铅抛向结构边，等待自由下沉，线动时轻柔扬竿。',desc:'虫体中段挂钩，自由下沉动作自然，适合慢速精细作钓。',color:'绿色南瓜 / 棕色',season:['summer','autumn']},
 {id:'crappie',name:'小型软虫',en:'GRUB / MICRO SOFT',icon:'〰',depth:['shallow','mid','bottom'],waters:['stream','river','pond','lake'],fish:['罗非鱼','黄颡鱼','白条（䱗）','鲹类（竹荚鱼等）'],method:'轻铅头小幅抖动，沿岸边、桥墩和水草边慢慢搜索。',desc:'小体积软饵，可用于微物竿或轻量装备。',color:'白 / 透明 / 虾色',season:['spring','summer']},
 {id:'swimbait_soft',name:'软式泳饵',en:'SOFT SWIMBAIT',icon:'≈',depth:['mid','deep'],waters:['lake','river','coast'],fish:['鳜鱼','鲈鱼（海鲈）','石斑鱼'],method:'匀速慢收或贴底跳动；钩尖可按障碍情况选择露出或藏钩。',desc:'鱼形软饵搭配铅头钩或曲柄钩，覆盖中底层。',color:'小鱼色 / 珍珠白',season:['summer','autumn']},
 {id:'frog_soft',name:'软蛙',en:'SOFT FROG',icon:'♧',depth:['surface','shallow'],waters:['lake','pond'],fish:['乌鳢（黑鱼）'],method:'贴着草面拖动或轻跳；鱼咬后保持线张力再扬竿。',desc:'柔软蛙形拟饵，可在浮草和障碍边操控。',color:'蛙色 / 黑色',season:['summer']}
];

const rigs = [
 ['德州钓组','子弹铅 + 曲柄钩 + 软饵，钩尖藏入饵体。','水草、乱石、树枝等重障碍区。'],['卡罗莱纳钓组','前置滑动铅与后端软饵分离，拖动时饵更自由。','开阔底部、缓坡与较大范围搜索。'],['倒吊钓组','主线端铅坠，支线钩饵悬在底部上方。','深水、硬底、需要原地细致逗钓。'],['铅头钩钓组','铅头钩直接挂软饵，结构简单、触底清晰。','江河、岸抛、鳜鱼与海水软饵。'],['无铅钓组','软饵不加铅或用轻钉铅，缓慢自由下沉。','浅水、清水、鱼警惕或鱼口慢。'],['Wacky 钓组','钩从虫体中段横穿，头尾自然摆动下沉。','池塘、码头、岸边结构精细作钓。'],['内德钓组','轻量蘑菇头铅 + 短软虫，保持站立或小幅拖动。','硬底浅水、低活性鲈鱼精细搜索。'],['自由钓组','通心铅在线上滑动，铅与软饵间有缓冲距离。','底部障碍、乱石或希望软饵自由飘落。'],['铅头钩泳层组','按铅头重量控制软饵下沉速度和工作水层。','中层搜索、河流与海鲈岸抛。'],['雷蛙组','雷蛙直接系线，必要时用防咬前导。','浮草、荷叶、厚水草等表层障碍。'],['复合亮片组','单钩带裙摆与旋转叶片，通常直连主线。','黑鲈水草边、倒木边快速搜索。'],['铁板组','金属饵直连或配助投钩，注意匹配线和环强度。','海岸远投、船钓垂直搜索、深水强流。']
];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const depthNames={surface:'水面',shallow:'浅层',mid:'中层',deep:'深层',bottom:'贴底'};
const lureMap=Object.fromEntries(lures.map(x=>[x.id,x]));
function lureArt(l){
 const order={minnow:1,jerkbait:2,pencil:3,popper:4,frog:5,crank:6,vib:7,spoon:8,spinner:9,spinnerbait:10,buzzbait:11,soft:12,jighead:13,metaljig:14,micro:15,blade:16,swimbait:17,tailspin:18,spintail:19,wacky:20,crappie:21,swimbait_soft:22,frog_soft:23};
 const number=String(order[l.id]||1).padStart(2,'0');
 return `<img class="lure-photo" src="./lure-photos/${number}.jpg" alt="${l.name}实物照片" loading="lazy" decoding="async" title="${l.name} · 用户上传照片">`;
}
function init(){
 $('#fishSelect').innerHTML=fish.map((f,i)=>`<option value="${i}">${f.name}</option>`).join('');
 $('#fishCount').textContent=fish.length;$('#lureCount').textContent=lures.length;
 renderLures();renderFish();renderRigs();recommend();
 $$('.tab,.mobile-nav button').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
 ['fishSelect','weatherSelect','waterSelect','depthSelect','claritySelect','seasonSelect'].forEach(id=>$('#'+id).addEventListener('change',recommend));
 $('#recommendBtn').addEventListener('click',recommend);
 $('#lureSearch').addEventListener('input',renderLures);$('#lureFilter').addEventListener('change',renderLures);
 $('#fishSearch').addEventListener('input',renderFish);$('#fishGroup').addEventListener('change',renderFish);$('#fishRegion').addEventListener('change',renderFish);
 initForecast();
 $('#waterSelect').addEventListener('change',()=>{if(forecastLocation)loadFishingForecast(forecastLocation);});
 if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function showPage(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));window.scrollTo({top:document.querySelector('.tabs').offsetTop,behavior:'smooth'});}
function recommend(){
 const f=fish[+$('#fishSelect').value]||fish[0],weather=$('#weatherSelect').value,water=$('#waterSelect').value,depth=$('#depthSelect').value,clarity=$('#claritySelect').value,season=$('#seasonSelect').value;
 let ranked=lures.map(l=>{let s=f.lures.includes(l.id)?6:0;if(l.depth.includes(depth))s+=4;else if((depth==='bottom'||depth==='deep')&&l.depth.includes('mid'))s+=1;if(l.waters.includes(water))s+=2;if(l.season.includes(season))s+=1;
  if(weather==='windy'&&['vib','spoon','metaljig','tailspin','spinnerbait'].includes(l.id))s+=2;
  if((weather==='overcast'||weather==='cloudy')&&['pencil','popper','minnow','spinnerbait','buzzbait'].includes(l.id))s+=1;
  if(weather==='sunny'&&['soft','jighead','crank','swimbait'].includes(l.id))s+=1;
  if(weather==='afterRain'&&['vib','spinner','spinnerbait','soft'].includes(l.id))s+=1;
  if(clarity==='stained'&&['vib','spinnerbait','crank','buzzbait','frog'].includes(l.id))s+=2;
  if(clarity==='clear'&&['minnow','jerkbait','soft','wacky','spoon'].includes(l.id))s+=1;
  if(water==='stream'&&['spoon','spinner','micro','minnow'].includes(l.id))s+=2;
  if(water==='coast'&&['metaljig','minnow','soft','vib'].includes(l.id))s+=2;
  return {...l,score:s};
 }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'zh-CN'));
 const picked=ranked.slice(0,3);const colors=clarity==='stained'?'亮色 / 强轮廓':clarity==='clear'?'自然色 / 透明':'银白 / 自然色';
 $('#results').innerHTML=picked.map((l,i)=>`<article class="result-card ${i===0?'featured':''}"><div class="result-top"><span class="rank">OPTION 0${i+1}</span><span class="score">匹配 ${Math.min(98,72+l.score*2)}%</span></div><div class="result-art">${lureArt(l)}</div><h3>${l.name}</h3><span class="result-type">${l.en}</span><div class="result-depth"><b>${l.depth.map(x=>depthNames[x]).join(' / ')}</b> 推荐经过：${depthNames[depth]||'中层'}</div><p>${l.method}</p><div class="result-meta"><span>钓组：${rigFor(l)}</span><span>配色：${colors}</span></div></article>`).join('');
}
function rigFor(l){if(l.id==='frog'||l.id==='frog_soft')return'雷蛙直连';if(l.id==='soft'||l.id==='wacky'||l.id==='swimbait_soft')return l.id==='wacky'?'Wacky':'德州 / 倒吊';if(l.id==='jighead'||l.id==='crappie'||l.id==='spintail')return'铅头钩';if(l.id==='metaljig')return'铁板组';if(l.id==='spinnerbait'||l.id==='buzzbait')return'直连';return'别针 / 直连';}
function renderLures(){const q=$('#lureSearch').value.trim().toLowerCase(),d=$('#lureFilter').value;const list=lures.filter(l=>(d==='all'||l.depth.includes(d))&&(!q||(l.name+l.en+l.desc+l.method).toLowerCase().includes(q)));$('#lureShown').textContent=`${list.length} / ${lures.length}`;$('#lureGrid').innerHTML=list.map(l=>`<article class="library-card"><div class="library-top"><div class="library-art">${lureArt(l)}</div><div class="tags">${l.depth.map(x=>`<span class="tag">${depthNames[x]}</span>`).join('')}</div></div><h3>${l.name}</h3><span class="english">${l.en}</span><p>${l.desc}</p></article>`).join('')||'<p class="small-note">没有找到符合条件的饵型。</p>';}
function renderFish(){const q=$('#fishSearch').value.trim().toLowerCase(),g=$('#fishGroup').value,r=$('#fishRegion').value;const list=fish.filter(f=>{const region=fishRegions[f.name]||'both';return(g==='all'||f.group===g)&&(r==='all'||region===r)&&(!q||(f.name+f.habitat+f.tip+(fishRegionNames[region]||'')).toLowerCase().includes(q));});$('#fishShown').textContent=`${list.length} / ${fish.length}`;$('#fishGrid').innerHTML=list.map((f,i)=>{const region=fishRegions[f.name]||'both';return`<article class="fish-card" data-fish="${fish.indexOf(f)}"><span class="fish-no">${String(i+1).padStart(2,'0')} · ${f.group}</span><span class="fish-region">${fishRegionNames[region]}</span><h3>${f.name}</h3><p>${f.tip}</p><div class="habitat">${f.habitat}</div></article>`;}).join('')||'<p class="small-note">没有找到符合条件的鱼种。</p>';$$('.fish-card').forEach(c=>c.addEventListener('click',()=>{ $('#fishSelect').value=c.dataset.fish;showPage('recommend');recommend();}));}
function renderRigs(){$('#rigGrid').innerHTML=rigs.map((r,i)=>`<article class="rig-card"><span class="rig-number">RIG / ${String(i+1).padStart(2,'0')}</span><h3>${r[0]}</h3><p>${r[1]}</p><span class="rig-use">${r[2]}</span></article>`).join('');}
let forecastLocation=null;
const weatherText={0:'晴朗',1:'大部晴朗',2:'局部多云',3:'阴天',45:'有雾',48:'雾凇',51:'毛毛雨',53:'小雨',55:'中雨',56:'冻毛毛雨',57:'冻毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'零星阵雨',81:'阵雨',82:'强阵雨',85:'阵雪',86:'强阵雪',95:'雷雨',96:'雷雨伴冰雹',99:'强雷雨伴冰雹'};
const weatherGlyph={晴朗:'☀',大部晴朗:'☀',局部多云:'◐',阴天:'☁',有雾:'≋',雾凇:'≋',小雨:'☂',中雨:'☂',大雨:'☂',阵雨:'☂',零星阵雨:'☂',强阵雨:'☂',雷雨:'⚡',强雷雨:'⚡'};
function initForecast(){
 $('#locationSearchBtn').addEventListener('click',searchFishingLocation);
 $('#locationInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchFishingLocation();}});
 $('#locateBtn').addEventListener('click',locateFishingLocation);
 $('#fishingAnalysis').addEventListener('click',e=>{const b=e.target.closest('[data-species]');if(!b)return;const i=fish.findIndex(f=>f.name===b.dataset.species);if(i>=0){$('#fishSelect').value=i;recommend();}});
 try{const saved=JSON.parse(localStorage.getItem('lureGuideWeatherLocation')||'null');if(saved&&Number.isFinite(saved.latitude)&&Number.isFinite(saved.longitude)){forecastLocation=saved;$('#locationInput').value=saved.name||'';loadFishingForecast(saved);}}catch{}
}
function setForecastStatus(message,isError=false){const el=$('#forecastStatus');el.textContent=message;el.classList.toggle('error',isError);}
function safeText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function searchFishingLocation(){
 const query=$('#locationInput').value.trim();if(!query){setForecastStatus('先输入城市或海边钓点名称。',true);$('#locationInput').focus();return;}
 setForecastStatus('正在查找地点…');$('#locationSearchBtn').disabled=true;
 const aliases={'厦门':'Xiamen','舟山':'Zhoushan','宁波':'Ningbo','福州':'Fuzhou','青岛':'Qingdao','大连':'Dalian','威海':'Weihai','烟台':'Yantai','汕头':'Shantou','深圳':'Shenzhen','广州':'Guangzhou','珠海':'Zhuhai','湛江':'Zhanjiang','北海':'Beihai','海口':'Haikou','三亚':'Sanya','上海':'Shanghai','天津':'Tianjin','丹东':'Dandong','秦皇岛':'Qinhuangdao','温州':'Wenzhou','连云港':'Lianyungang','台州':'Taizhou','香港':'Hong Kong','澳门':'Macau'};
 const normalized=query.replace(/市$/,'');const searchNames=[normalized,query,aliases[query]||aliases[normalized]].filter((v,i,a)=>v&&a.indexOf(v)===i);
 try{
  let results=[];const countryCodes=['CN','HK','MO','TW'];
  for(const countryCode of countryCodes){for(const name of searchNames){const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=100&language=zh&format=json&countryCode=${countryCode}`;const res=await fetch(url);if(!res.ok)throw new Error('地点服务暂不可用');const data=await res.json();if(data.results?.length)results.push(...data.results);}}
  const cityResults=results.filter(p=>/^(PPLC|PPLA\d*|PPL)$/.test(p.feature_code||'')&&!/(区|县|旗|街道|乡|镇)$/.test(p.name||''));
  if(!cityResults.length)throw new Error('没找到这个城市，请输入市级城市名称再试。');
  const featureRank={PPLC:0,PPLA:1,PPLA1:1,PPLA2:2,PPLA3:3,PPLA4:4,PPLA5:5,PPL:6};
  cityResults.sort((a,b)=>{const exactA=Number(a.name===normalized||a.name===query),exactB=Number(b.name===normalized||b.name===query);return exactB-exactA||(featureRank[a.feature_code]??9)-(featureRank[b.feature_code]??9)||(b.population||0)-(a.population||0);});
  const p=cityResults[0],parts=[p.name,p.admin1,p.country].filter((v,i,a)=>v&&a.indexOf(v)===i);forecastLocation={latitude:p.latitude,longitude:p.longitude,name:parts.join(' · ')};await loadFishingForecast(forecastLocation);
 }catch(err){setForecastStatus(err.message||'地点查询失败，请稍后重试。',true);}finally{$('#locationSearchBtn').disabled=false;}
}
function locateFishingLocation(){
 if(!navigator.geolocation){setForecastStatus('此浏览器不支持定位，请输入城市名称。',true);return;}
 setForecastStatus('请允许浏览器获取位置，以查询附近天气…');
 navigator.geolocation.getCurrentPosition(pos=>{forecastLocation={latitude:pos.coords.latitude,longitude:pos.coords.longitude,name:`当前位置 · ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`};$('#locationInput').value='当前位置';loadFishingForecast(forecastLocation);},err=>{setForecastStatus(err.code===1?'未获得定位权限；也可以直接输入城市名称。':'定位暂不可用；请检查网络或输入城市名称。',true);},{enableHighAccuracy:false,timeout:12000,maximumAge:600000});
}
async function loadFishingForecast(location){
 forecastLocation=location;setForecastStatus('正在更新天气和适钓分析…');$('#locationSearchBtn').disabled=true;
 const coords=`latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}`;
 const weatherUrl=`https://api.open-meteo.com/v1/forecast?${coords}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&forecast_days=2&timezone=auto&wind_speed_unit=kmh`;
 const marineUrl=`https://marine-api.open-meteo.com/v1/marine?${coords}&hourly=sea_level_height_msl,wave_height,wave_period,sea_surface_temperature&forecast_days=2&timezone=auto&cell_selection=sea`;
 try{
  const [weatherRes,marineRes]=await Promise.all([fetch(weatherUrl),$('#waterSelect').value==='coast'?fetch(marineUrl).catch(()=>null):Promise.resolve(null)]);
  if(!weatherRes.ok)throw new Error('天气服务暂不可用，请检查网络后重试。');
  const weather=await weatherRes.json();const marine=marineRes&&marineRes.ok?await marineRes.json():null;
  localStorage.setItem('lureGuideWeatherLocation',JSON.stringify(location));renderFishingForecast(weather,marine,location);setForecastStatus('天气已更新；建议结合现场风浪、鱼群和水色判断。');
 }catch(err){setForecastStatus(err.message||'天气更新失败，请稍后重试。',true);}finally{$('#locationSearchBtn').disabled=false;}
}
function forecastIndex(times){let best=0,delta=Infinity;const now=Date.now();for(let i=0;i<(times||[]).length;i++){const d=Math.abs(new Date(times[i]).getTime()-now);if(Number.isFinite(d)&&d<delta){delta=d;best=i;}}return best;}
function weatherLabel(code){return weatherText[code]||'天气变化';}
function renderFishingForecast(weather,marine,location){
 const current=weather.current||{},hourly=weather.hourly||{},times=hourly.time||[],idx=forecastIndex(times),code=Number(current.weather_code),desc=weatherLabel(code),wind=Number(current.wind_speed_10m)||0,temp=Number(current.temperature_2m),rainNow=Number(current.precipitation)||0;
 $('#forecastContent').hidden=false;$('#forecastPlace').textContent=location.name||'所选地点';$('#forecastUpdated').textContent=`更新于 ${String(current.time||'').replace('T',' ')}`;
 const glyph=weatherGlyph[desc]||'☁';
 $('#currentWeather').innerHTML=`<div class="weather-main"><span class="weather-glyph">${glyph}</span><div><span class="weather-caption">当前天气</span><strong>${safeText(desc)}</strong><span>${Number.isFinite(temp)?Math.round(temp)+'°':'--'}<small>体感 ${Number.isFinite(Number(current.apparent_temperature))?Math.round(current.apparent_temperature)+'°':'--'}</small></span></div></div><div class="weather-facts"><div><span>风速</span><strong>${Math.round(wind)}<small> km/h</small></strong></div><div><span>阵风</span><strong>${Number.isFinite(Number(current.wind_gusts_10m))?Math.round(current.wind_gusts_10m):'--'}<small> km/h</small></strong></div><div><span>降水</span><strong>${rainNow.toFixed(1)}<small> mm</small></strong></div><div><span>湿度</span><strong>${Number.isFinite(Number(current.relative_humidity_2m))?Math.round(current.relative_humidity_2m):'--'}<small>%</small></strong></div></div>`;
 const cards=[];for(let i=idx;i<Math.min(times.length,idx+19);i+=3){const c=Number(hourly.weather_code?.[i]),t=Number(hourly.temperature_2m?.[i]),pop=Number(hourly.precipitation_probability?.[i]);cards.push(`<div class="hour-card"><span>${i===idx?'现在':safeText(times[i]?.slice(11,16)||'--:--')}</span><b>${safeText(weatherGlyph[weatherLabel(c)]||'☁')}</b><strong>${Number.isFinite(t)?Math.round(t)+'°':'--'}</strong><small>雨 ${Number.isFinite(pop)?Math.round(pop):0}%</small></div>`);}
 $('#hourlyStrip').innerHTML=cards.join('')||'<p class="small-note">暂时没有逐小时预报。</p>';
 const tide=buildTideSummary(marine);$('#tidePanel').innerHTML=tide.html;$('#fishingAnalysis').innerHTML=buildFishingAdvice({current,hourly,idx,marine,tide,desc,wind,temp,code,rainNow});
}
function buildTideSummary(marine){
 if($('#waterSelect').value!=='coast')return{direction:'淡水',delta:0,html:'<div class="tide-empty"><div class="forecast-subhead"><strong>潮汐</strong><span>淡水钓点</span></div><p>当前选择的是淡水水域，潮汐不作为选鱼依据。切换到“近岸海水”后，可查看海面潮位模型趋势。</p></div>'};
 const h=marine?.hourly?.sea_level_height_msl||[],times=marine?.hourly?.time||[];if(h.length<4)return{direction:'未知',delta:0,html:'<div class="tide-empty"><div class="forecast-subhead"><strong>潮汐</strong><span>该海域暂无潮位模型数据</span></div><p>天气仍可查看；请以当地潮汐站或海事部门发布的潮汐表为准。</p></div>'};
 const mid=forecastIndex(times),base=Number(h[mid]),later=Number(h[Math.min(mid+3,h.length-1)]),delta=Number.isFinite(base)&&Number.isFinite(later)?later-base:0,direction=delta>.035?'涨潮趋势':delta<-.035?'落潮趋势':'潮位变化较缓';
 const end=Math.min(h.length-1,mid+36),ext=[];for(let i=mid+1;i<end;i++){const v=Number(h[i]),a=Number(h[i-1]),b=Number(h[i+1]);if(![v,a,b].every(Number.isFinite))continue;if(v>a&&v>b)ext.push({i,type:'预计高潮'});else if(v<a&&v<b)ext.push({i,type:'预计低潮'});}
 const next=ext.slice(0,3),valid=h.slice(mid,Math.min(mid+25,h.length)).map(Number).filter(Number.isFinite);let chart='';if(valid.length>2){const lo=Math.min(...valid),hi=Math.max(...valid),span=hi-lo||1;const pts=valid.map((v,i)=>`${Math.round(i*600/(valid.length-1))},${Math.round(84-(v-lo)/span*64)}`).join(' ');const labels=[times[mid]?.slice(11,16),times[Math.min(mid+12,times.length-1)]?.slice(11,16),times[Math.min(mid+24,times.length-1)]?.slice(11,16)].filter(Boolean);chart=`<svg class="tide-chart" viewBox="0 0 600 100" role="img" aria-label="未来约一天潮位变化趋势"><line x1="0" y1="84" x2="600" y2="84"/><polyline points="${pts}"/><text x="0" y="98">${safeText(labels[0]||'')}</text><text x="286" y="98">${safeText(labels[1]||'')}</text><text x="550" y="98">${safeText(labels[2]||'')}</text></svg>`;}
 const turns=next.length?next.map(x=>`<span class="tide-turn"><b>${x.type}</b><strong>${safeText(times[x.i]?.slice(11,16)||'--:--')}</strong></span>`).join(''):'<span class="tide-turn"><b>转潮时间</b><strong>暂无</strong></span>';
 return{direction,delta,html:`<div class="tide-panel-head"><div class="forecast-subhead"><strong>近岸潮位趋势</strong><span>未来约 36 小时</span></div><div class="tide-direction"><strong>${safeText(direction)}</strong><span>3 小时变化 ${delta>=0?'+':''}${delta.toFixed(2)} m</span></div></div>${chart}<div class="tide-turns">${turns}</div><p class="tide-caveat">潮位取自海洋数值模式并非当地验潮站实测；复杂岸线附近可能偏差较大。</p>`};
}
function buildFishingAdvice({hourly,idx,marine,tide,desc,wind,temp,code,rainNow}){
 let score=82;const reasons=[];const storm=code>=95;const rainProb=(hourly.precipitation_probability||[]).slice(idx,idx+7).map(Number).filter(Number.isFinite);const maxRain=rainProb.length?Math.max(...rainProb):0;
 if(storm){score=8;reasons.push('预报有雷暴，安全优先，暂停岸边或船上作钓。');}else if(wind>=35){score-=38;reasons.push('风速较大，抛投和控线困难，避开迎风岸及外海位置。');}else if(wind>=25){score-=22;reasons.push('风偏大，选择背风岸或避风湾，并减轻外出风险。');}else if(wind>=15){score-=10;reasons.push('有风会影响控饵，可从背风岸或侧风位开始。');}else reasons.push('当前风力较温和，抛投和操控条件较友好。');
 if(maxRain>=75||rainNow>=5){score-=16;reasons.push(`近期降雨概率最高约 ${Math.round(maxRain)}%，注意雨势、水位和能见度。`);}else if(maxRain>=40||rainNow>0){score-=6;reasons.push('有阵雨可能，准备防雨并留意雨后水色变化。');}
 if(Number.isFinite(temp)){if(temp<5||temp>33){score-=12;reasons.push('气温偏冷/偏热，鱼可能降低活动范围，放慢搜索节奏。');}else if(temp>=10&&temp<=28){score+=4;reasons.push('气温处于较温和区间，可先搜索鱼群活动水层。');}}
 const waves=marine?.hourly?.wave_height||[],mt=marine?.hourly?.time||[],mi=forecastIndex(mt),waveMax=waves.slice(mi,mi+12).map(Number).filter(Number.isFinite);if($('#waterSelect').value==='coast'&&waveMax.length){const maxWave=Math.max(...waveMax);if(maxWave>2.2){score-=22;reasons.push(`近海模式预报浪高约 ${maxWave.toFixed(1)} m，谨慎评估岸线和出海安全。`);}else if(maxWave>1.2){score-=10;reasons.push(`近海模式浪高约 ${maxWave.toFixed(1)} m，优先选择背浪、避风点。`);}}
 if($('#waterSelect').value==='coast'&&tide.direction!=='淡水'&&tide.direction!=='未知'&&Math.abs(tide.delta)>.06){score+=5;reasons.push(`${tide.direction}，可优先观察潮沟、河口或结构边的饵鱼活动。`);}
 score=Math.max(0,Math.min(100,score));const grade=storm||score<35?'不建议':score<58?'一般':score<78?'可以尝试':'较适合';const water=$('#waterSelect').value;let candidates;
 if(water==='coast')candidates=tide.direction==='涨潮趋势'?['鲈鱼（海鲈）','鲹类（竹荚鱼等）','黑鲷','鲷类（真鲷等）']:['鲈鱼（海鲈）','石斑鱼','马鲛（鲅鱼）','带鱼'];else if(water==='stream')candidates=['马口鱼','宽鳍鱲（溪哥）','虹鳟'];else if(water==='river')candidates=['翘嘴鲌','鳜鱼','红鳍原鲌（青梢）','鲶鱼'];else if(water==='pond')candidates=['大口黑鲈（加州鲈）','乌鳢（黑鱼）','月鳢（七星鱼）','罗非鱼'];else candidates=temp<10?['鳜鱼','鲶鱼','大口黑鲈（加州鲈）','翘嘴鲌']:['翘嘴鲌','大口黑鲈（加州鲈）','鳜鱼','鳡鱼'];if(storm)candidates=candidates.slice(0,2);
 const chips=candidates.slice(0,3).map(name=>fish.some(f=>f.name===name)?`<button type="button" class="fish-chip" data-species="${safeText(name)}">${safeText(name)} ↗</button>`:`<span class="fish-chip static">${safeText(name)}</span>`).join('');
 return`<div class="analysis-top"><div><span class="eyebrow">FISHING WINDOW</span><h4>适钓评估</h4></div><div class="fishing-grade ${storm||score<35?'poor':score<58?'fair':score<78?'good':'best'}"><strong>${grade}</strong><span>${score} / 100</span></div></div><p class="analysis-note">按天气、风雨${water==='coast'?'与潮浪趋势':'与所选水域'}做的启发式参考，不代表鱼获保证。</p><ul class="analysis-reasons">${reasons.slice(0,3).map(s=>`<li>${safeText(s)}</li>`).join('')}</ul><div class="species-suggest"><span>可优先考虑</span><div>${chips}</div></div>${storm?'<p class="safety-alert">雷雨、强风或突发涨水时请停止作钓，遵守当地禁钓与海岸安全提示。</p>':''}`;
}
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').hidden=false;});$('#installBtn').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();installPrompt=null;$('#installBtn').hidden=true;}});
init();

/* 钓点地图与天气、选饵建议联动。 */
window.LureSiteHooks={
 showSpotWeather(loc){
  if(!loc||!Number.isFinite(loc.lat)||!Number.isFinite(loc.lng))return;
  forecastLocation={latitude:loc.lat,longitude:loc.lng,name:loc.name||'所选钓点'};
  const water=loc.water||'lake';
  if($('#waterSelect')&&['lake','river','pond','coast','stream'].includes(water))$('#waterSelect').value=water;
  if($('#locationInput'))$('#locationInput').value=loc.name||'';
  showPage('recommend');
  loadFishingForecast(forecastLocation);
 },
 showSpotLure(detail){
  if(!detail)return;
  const water=detail.water||'lake';
  if($('#waterSelect')&&['lake','river','pond','coast','stream'].includes(water))$('#waterSelect').value=water;
  const i=fish.findIndex(f=>f.name===detail.fishName);
  if(i>=0&&$('#fishSelect'))$('#fishSelect').value=i;
  showPage('recommend');
  recommend();
 }
};
