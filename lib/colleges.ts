export type CollegeType = 'iit' | 'nit' | 'iim' | 'aiims' | 'nlu' | 'iisc' | 'central-university' | 'state-university' | 'private' | 'foreign';
export type CollegeCountry = 'india' | 'usa' | 'uk' | 'canada' | 'australia' | 'germany' | 'singapore' | 'other';

export interface College {
  id: string;
  slug: string;
  nameEn: string;
  nameHi?: string;
  type: CollegeType;
  country: CollegeCountry;
  city: string;
  state?: string;
  established: number;
  ranking?: { nirf?: number; qs?: number; the?: number };
  admissionExams: string[];
  websiteUrl?: string;
  descriptionEn: string;
  descriptionHi?: string;
  courses: string[];
}

export const COLLEGES: College[] = [
  {
    id: 'iit-bombay',
    slug: 'iit-bombay',
    nameEn: 'Indian Institute of Technology Bombay',
    nameHi: 'भारतीय प्रौद्योगिकी संस्थान बॉम्बे',
    type: 'iit',
    country: 'india',
    city: 'Mumbai',
    state: 'Maharashtra',
    established: 1958,
    ranking: { nirf: 3, qs: 118 },
    admissionExams: ['JEE Advanced'],
    websiteUrl: 'https://www.iitb.ac.in',
    descriptionEn:
      'IIT Bombay is one of India\'s premier engineering institutions, known for excellence in technology and research. Located in Powai, Mumbai, it offers undergraduate, postgraduate, and doctoral programmes across engineering, sciences, design, and management.',
    descriptionHi:
      'आईआईटी बॉम्बे भारत के प्रमुख इंजीनियरिंग संस्थानों में से एक है, जो प्रौद्योगिकी और अनुसंधान में उत्कृष्टता के लिए जाना जाता है।',
    courses: ['B.Tech', 'M.Tech', 'M.Sc', 'MBA', 'Ph.D'],
  },
  {
    id: 'iit-delhi',
    slug: 'iit-delhi',
    nameEn: 'Indian Institute of Technology Delhi',
    nameHi: 'भारतीय प्रौद्योगिकी संस्थान दिल्ली',
    type: 'iit',
    country: 'india',
    city: 'New Delhi',
    state: 'Delhi',
    established: 1961,
    ranking: { nirf: 2, qs: 150 },
    admissionExams: ['JEE Advanced'],
    websiteUrl: 'https://home.iitd.ac.in',
    descriptionEn:
      'IIT Delhi is a public technical university established in 1961. It is one of India\'s top-ranked institutions for engineering and technology, located in Hauz Khas, New Delhi.',
    courses: ['B.Tech', 'M.Tech', 'M.Sc', 'MBA', 'Ph.D'],
  },
  {
    id: 'iit-madras',
    slug: 'iit-madras',
    nameEn: 'Indian Institute of Technology Madras',
    nameHi: 'भारतीय प्रौद्योगिकी संस्थान मद्रास',
    type: 'iit',
    country: 'india',
    city: 'Chennai',
    state: 'Tamil Nadu',
    established: 1959,
    ranking: { nirf: 1, qs: 227 },
    admissionExams: ['JEE Advanced'],
    websiteUrl: 'https://www.iitm.ac.in',
    descriptionEn:
      'IIT Madras has been ranked the No. 1 engineering institution in India by NIRF for multiple consecutive years. It is located within a forested campus in Chennai and is known for its research output and industry partnerships.',
    courses: ['B.Tech', 'M.Tech', 'M.Sc', 'MBA', 'Ph.D', 'B.S'],
  },
  {
    id: 'iit-kanpur',
    slug: 'iit-kanpur',
    nameEn: 'Indian Institute of Technology Kanpur',
    nameHi: 'भारतीय प्रौद्योगिकी संस्थान कानपुर',
    type: 'iit',
    country: 'india',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    established: 1959,
    ranking: { nirf: 4, qs: 278 },
    admissionExams: ['JEE Advanced'],
    websiteUrl: 'https://www.iitk.ac.in',
    descriptionEn:
      'IIT Kanpur was the first Indian institution to offer Computer Science education and has a strong reputation for entrepreneurship and research. It is one of the original five IITs established with foreign collaboration.',
    courses: ['B.Tech', 'M.Tech', 'M.Sc', 'MBA', 'Ph.D'],
  },
  {
    id: 'iit-kharagpur',
    slug: 'iit-kharagpur',
    nameEn: 'Indian Institute of Technology Kharagpur',
    nameHi: 'भारतीय प्रौद्योगिकी संस्थान खड़गपुर',
    type: 'iit',
    country: 'india',
    city: 'Kharagpur',
    state: 'West Bengal',
    established: 1951,
    ranking: { nirf: 5, qs: 271 },
    admissionExams: ['JEE Advanced'],
    websiteUrl: 'https://www.iitkgp.ac.in',
    descriptionEn:
      'The oldest IIT, established in 1951, IIT Kharagpur is India\'s largest IIT campus. It is known for its diverse programme offerings including law, management, and medical sciences alongside engineering.',
    courses: ['B.Tech', 'Dual Degree', 'M.Tech', 'MBA', 'MCA', 'Ph.D'],
  },
  {
    id: 'nit-trichy',
    slug: 'nit-trichy',
    nameEn: 'National Institute of Technology Tiruchirappalli',
    nameHi: 'राष्ट्रीय प्रौद्योगिकी संस्थान तिरुचिरापल्ली',
    type: 'nit',
    country: 'india',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    established: 1964,
    ranking: { nirf: 8 },
    admissionExams: ['JEE Main'],
    websiteUrl: 'https://www.nitt.edu',
    descriptionEn:
      'NIT Trichy is consistently ranked among the top NITs in India. It is known for its excellent placement record and alumni network across the globe.',
    courses: ['B.Tech', 'M.Tech', 'M.Sc', 'MCA', 'Ph.D'],
  },
  {
    id: 'iim-ahmedabad',
    slug: 'iim-ahmedabad',
    nameEn: 'Indian Institute of Management Ahmedabad',
    nameHi: 'भारतीय प्रबंधन संस्थान अहमदाबाद',
    type: 'iim',
    country: 'india',
    city: 'Ahmedabad',
    state: 'Gujarat',
    established: 1961,
    ranking: { nirf: 1 },
    admissionExams: ['CAT'],
    websiteUrl: 'https://www.iima.ac.in',
    descriptionEn:
      'IIM Ahmedabad is India\'s premier management institution and one of the most prestigious business schools in Asia. Its flagship Post Graduate Programme (PGP) is widely regarded as equivalent to the best global MBAs.',
    courses: ['PGP (MBA)', 'PGPX', 'FPM (Ph.D)', 'Executive Education'],
  },
  {
    id: 'iim-bangalore',
    slug: 'iim-bangalore',
    nameEn: 'Indian Institute of Management Bangalore',
    nameHi: 'भारतीय प्रबंधन संस्थान बेंगलुरु',
    type: 'iim',
    country: 'india',
    city: 'Bengaluru',
    state: 'Karnataka',
    established: 1973,
    ranking: { nirf: 2 },
    admissionExams: ['CAT'],
    websiteUrl: 'https://www.iimb.ac.in',
    descriptionEn:
      'IIM Bangalore is located in India\'s technology capital and is known for its strong emphasis on entrepreneurship, public policy, and corporate strategy. It is among Asia\'s top-ranked business schools.',
    courses: ['PGP (MBA)', 'PGPEM', 'FPM (Ph.D)', 'Executive Education'],
  },
  {
    id: 'aiims-delhi',
    slug: 'aiims-delhi',
    nameEn: 'All India Institute of Medical Sciences Delhi',
    nameHi: 'अखिल भारतीय आयुर्विज्ञान संस्थान दिल्ली',
    type: 'aiims',
    country: 'india',
    city: 'New Delhi',
    state: 'Delhi',
    established: 1956,
    ranking: { nirf: 1 },
    admissionExams: ['NEET UG', 'NEET PG'],
    websiteUrl: 'https://www.aiims.edu',
    descriptionEn:
      'AIIMS Delhi is India\'s most prestigious medical institution, combining cutting-edge research, patient care, and medical education. Admission to the MBBS programme is through NEET UG with a separate merit list.',
    courses: ['MBBS', 'MD', 'MS', 'B.Sc Nursing', 'Ph.D'],
  },
  {
    id: 'nlu-delhi',
    slug: 'nlu-delhi',
    nameEn: 'National Law University Delhi',
    nameHi: 'राष्ट्रीय विधि विश्वविद्यालय दिल्ली',
    type: 'nlu',
    country: 'india',
    city: 'New Delhi',
    state: 'Delhi',
    established: 2008,
    ranking: { nirf: 1 },
    admissionExams: ['AILET'],
    websiteUrl: 'https://nludelhi.ac.in',
    descriptionEn:
      'NLU Delhi is the top-ranked law school in India. It admits students through AILET (All India Law Entrance Test) for its integrated B.A. LL.B. (Hons.) programme. Placement salaries are among the highest for law graduates in India.',
    courses: ['B.A. LL.B. (Hons.)', 'LL.M.', 'Ph.D'],
  },
  {
    id: 'mit',
    slug: 'mit-cambridge',
    nameEn: 'Massachusetts Institute of Technology',
    type: 'foreign',
    country: 'usa',
    city: 'Cambridge, Massachusetts',
    established: 1861,
    ranking: { qs: 1, the: 5 },
    admissionExams: ['SAT/ACT', 'TOEFL/IELTS'],
    websiteUrl: 'https://www.mit.edu',
    descriptionEn:
      'MIT is consistently ranked the world\'s #1 university by QS. Its admission is highly selective (acceptance rate ~4%). It is renowned for engineering, computer science, physics, economics, and interdisciplinary research.',
    courses: ['B.S.', 'M.S.', 'M.Eng', 'MBA (Sloan)', 'Ph.D'],
  },
  {
    id: 'oxford',
    slug: 'university-of-oxford',
    nameEn: 'University of Oxford',
    type: 'foreign',
    country: 'uk',
    city: 'Oxford',
    established: 1096,
    ranking: { qs: 3, the: 1 },
    admissionExams: ['A-Levels / IB', 'IELTS/TOEFL', 'UCAS'],
    websiteUrl: 'https://www.ox.ac.uk',
    descriptionEn:
      'The University of Oxford is the oldest English-speaking university in the world and consistently ranked among the world\'s top three. It operates on a tutorial system and is world-renowned for humanities, law, medicine, and sciences.',
    courses: ['BA', 'MEng', 'MSc', 'MBA (Saïd)', 'DPhil (Ph.D)'],
  },
  {
    id: 'cambridge',
    slug: 'university-of-cambridge',
    nameEn: 'University of Cambridge',
    type: 'foreign',
    country: 'uk',
    city: 'Cambridge',
    established: 1209,
    ranking: { qs: 2, the: 4 },
    admissionExams: ['A-Levels / IB', 'IELTS/TOEFL', 'UCAS'],
    websiteUrl: 'https://www.cam.ac.uk',
    descriptionEn:
      'Cambridge is one of the world\'s oldest and most prestigious universities, home to 31 colleges. It is ranked #2 globally by QS and is known for science, engineering, mathematics, law, and economics.',
    courses: ['BA/MEng', 'MSc', 'MPhil', 'MBA (Judge)', 'Ph.D'],
  },
];

/** Quick lookup helpers */
export const COLLEGES_BY_TYPE = (type: CollegeType) =>
  COLLEGES.filter((c) => c.type === type);

export const COLLEGES_BY_COUNTRY = (country: CollegeCountry) =>
  COLLEGES.filter((c) => c.country === country);

export const getCollegeBySlug = (slug: string) =>
  COLLEGES.find((c) => c.slug === slug);
