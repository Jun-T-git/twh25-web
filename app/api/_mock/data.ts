import { MasterIdeology, MasterPolicy } from "@/app/types/firestore";

export const MOCK_POLICIES: MasterPolicy[] = [
  {
    id: 'policy_001',
    title: '郊外型ショッピングモール誘致',
    description: '郊外に大規模なショッピングモールを建設します。経済効果は高いですが、商店街の衰退が懸念されます。',
    newsFlash: '「便利になった」「街の個性が消えた」... 巨大モールオープンに賛否両論',
    effects: { economy: 15, environment: -5, welfare: -5 },
  },
  {
    id: 'policy_002',
    title: '駅前緑化プロジェクト',
    description: '駅前の工場跡地を公園にします。環境と福祉が向上しますが、維持費がかかります。',
    newsFlash: '駅前に新たな憩いの場が誕生。市民の笑顔が増える一方、財政への負担も',
    effects: { environment: 10, welfare: 5, economy: -5 },
  },
  {
    id: 'policy_003',
    title: 'AI監視カメラ網構築',
    description: 'AI顔認証カメラを街中に設置し、指名手配犯の即時検知と犯罪抑止を行います。',
    newsFlash: '犯罪検挙率が劇的向上。「安心」を手に入れた街、失われた「プライバシー」',
    effects: { security: 20, humanRights: -15 },
  },
  {
    id: 'policy_004',
    title: 'ハイテク産業特区指定',
    description: '法人税を優遇し、IT企業を誘致します。教育レベルの向上が見込まれますが、格差が広がる可能性があります。',
    newsFlash: 'シリコンバレー化するベッドタウン。地価高騰で古くからの住民に退去の波',
    effects: { economy: 20, education: 10, welfare: -10 },
  },
  {
    id: 'policy_005',
    title: '高齢者医療の完全無料化',
    description: '高齢者の医療費をゼロにします。福祉は向上しますが、現役世代の負担増は避けられません。',
    newsFlash: '「老後の楽園」と化す街。若者世代の流出が止まらない',
    effects: { welfare: 20, economy: -15 },
  },
  {
    id: 'policy_006',
    title: '義務教育への金融教育導入',
    description: '小中学校で投資や資産形成の授業を必修化します。',
    newsFlash: '小学生が株価を語る街。高い金融リテラシーが次世代の武器に',
    effects: { education: 15, economy: 5 },
  },
    {
    id: 'policy_007',
    title: '外国人参政権の導入',
    description: '定住外国人に地方参政権を付与します。人権意識は高まりますが、治安への懸念も。',
    newsFlash: '多様性を認める先進都市へ。一部では激しい抗議デモも発生',
    effects: { humanRights: 20, security: -10 },
  },
  {
    id: 'policy_008',
    title: 'ゴミ処理場の最新化',
    description: '高効率な焼却炉を導入し、発電も行います。',
    newsFlash: 'ゴミがエネルギーに変わる。環境先進都市としての第一歩',
    effects: { environment: 15, economy: 5 },
  },
  {
    id: 'policy_009',
    title: '夜間外出禁止令',
    description: '青少年の夜間外出を厳しく制限します。治安は改善しますが、自由が制限されます。',
    newsFlash: '静寂に包まれる夜の街。若者たちの不満がSNSで爆発',
    effects: { security: 15, humanRights: -10, economy: -5 },
  }
];

export const MOCK_IDEOLOGIES: MasterIdeology[] = [
  {
    id: 'conservative',
    name: '保守',
    description: '伝統と秩序を重んじる。治安と経済を重視する傾向がある。',
    coefficients: { security: 1.5, economy: 1.2, humanRights: 0.8 },
  },
  {
    id: 'liberal',
    name: 'リベラル',
    description: '個人の自由と多様性を重んじる。人権と環境を重視する傾向がある。',
    coefficients: { humanRights: 1.5, environment: 1.2, security: 0.8 },
  },
  {
    id: 'capitalist',
    name: '資本主義',
    description: '自由競争と経済成長を至上とする。経済と教育を重視する。',
    coefficients: { economy: 1.5, education: 1.2, welfare: 0.8 },
  },
  {
    id: 'socialist',
    name: '社会福祉',
    description: '平等と社会的保護を重視する。福祉と環境を重視する。',
    coefficients: { welfare: 1.5, environment: 1.2, economy: 0.8 },
  },
];
