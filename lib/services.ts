// lib/services.ts
export type Service = {
  slug: string;
  title: string;
  arTitle: string;
  description: string;
  arDescription: string;
  faqs: { q: string; a: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: "structured-cabling",
    title: "Structured Cabling",
    arTitle: "تمديدات الشبكة",
    description:
      "Standards-based copper & fiber, labeling, testing, and as-built handover. BOCC delivers neat runs and audit-ready documentation.",
    arDescription:
      "كوابل نحاسية وألياف وفق المعايير مع الترقيم والاختبار وتسليم المخططات. تنفيذ نظيف وتوثيق جاهز للتدقيق.",
    faqs: [
      { q: "How long does installation take?", a: "Small offices: 1–2 days. Larger sites depend on scope and cable runs." },
      { q: "Do you certify the cabling?", a: "Yes. We label, test, and provide as-built drawings and results." },
    ],
  },
  {
    slug: "network-solutions",
    title: "Network Solutions",
    arTitle: "حلول الشبكات",
    description:
      "Switching, routing, Wi-Fi design, rack layout and commissioning. Business-ready networks with clean documentation.",
    arDescription:
      "سويتشات، راوترات، تصميم واي-فاي، وترتيب الراك والتفعيل. شبكات جاهزة للأعمال مع توثيق نظيف.",
    faqs: [
      { q: "Do you provide Wi-Fi heatmaps?", a: "Yes. We can survey and deliver coverage/throughput plans." },
    ],
  },
  {
    slug: "cctv-installation",
    title: "CCTV Installation",
    arTitle: "أنظمة المراقبة",
    description:
      "IP cameras, NVR sizing, retention planning, monitoring and SLA-backed maintenance.",
    arDescription:
      "كاميرات IP، تقدير سعة التسجيل والحفظ، المراقبة والصيانة بضمان مستويات خدمة.",
    faqs: [
      { q: "Which brands do you support?", a: "Hikvision, Dahua, Axis, Hanwha, Uniview and others." },
    ],
  },
  {
    slug: "access-control",
    title: "Access Control",
    arTitle: "التحكم بالدخول",
    description:
      "Controllers, readers, EM locks, turnstiles, doors & handover packs meeting compliance.",
    arDescription:
      "أجهزة تحكم وقارئات وأقفال كهربائية وبوابات وأبواب وحزمة تسليم متوافقة.",
    faqs: [],
  },
  {
    slug: "audio-visual",
    title: "Audio-Visual",
    arTitle: "الصوتيات والمرئيات",
    description:
      "Meeting rooms, displays, DSPs, control and cabling with neat finishing.",
    arDescription:
      "قاعات اجتماعات وشاشات ومعالجات صوت وتحكم وتمديدات بإنهاء نظيف.",
    faqs: [],
  },
  {
    slug: "electrical-works",
    title: "Electrical Works",
    arTitle: "الأعمال الكهربائية",
    description:
      "Wiring, lighting, distribution boards, conduits, compliance and reports.",
    arDescription:
      "تمديدات وإنارة ولوحات توزيع ومواسير وتوافق مع المعايير وتقارير.",
    faqs: [],
  },
];