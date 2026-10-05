export interface SchemeRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  documents_required: string[];
  application_process: string[];
  source: string;
  url?: string;
  last_updated: string;
  language?: string;
  states?: string[];
  education_level?: string[];
  [key: string]: any;
}

export const ALL_SCHEMES: SchemeRecord[] = [
  {
    "id": "agr-001",
    "title": "PM-KISAN Samman Nidhi",
    "category": "Agriculture",
    "description": "Income support scheme providing direct cash transfers to landholding farmer families to help meet input costs for agriculture.",
    "eligibility": [
      "Small and marginal farmer families with cultivable landholding",
      "Excludes institutional landholders and higher income tax payees",
      "Farmer's land records must be updated in the state revenue database"
    ],
    "benefits": [
      "Rs. 6,000 per year paid in three equal installments of Rs. 2,000",
      "Direct benefit transfer to the farmer's bank account"
    ],
    "documents_required": [
      "Aadhaar card",
      "Land ownership records",
      "Bank account details",
      "Farmer registration on the PM-KISAN portal"
    ],
    "application_process": [
      "Register through the PM-KISAN portal or nearest Common Service Centre",
      "Provide land record and Aadhaar details",
      "Village revenue officer verifies land ownership",
      "Approved beneficiaries receive installments via DBT"
    ],
    "source": "Ministry of Agriculture & Farmers Welfare, Govt of India (pmkisan.gov.in)",
    "url": "https://pmkisan.gov.in",
    "last_updated": "2025-12-28",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "agr-002",
    "title": "Pradhan Mantri Fasal Bima Yojana",
    "category": "Agriculture",
    "description": "Crop insurance scheme protecting farmers against yield losses due to natural calamities, pests and diseases.",
    "eligibility": [
      "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers",
      "Enrollment is compulsory for loanee farmers and voluntary for non-loanee farmers"
    ],
    "benefits": [
      "Comprehensive risk cover for pre-sowing to post-harvest losses",
      "Low uniform premium for farmers (as low as 1.5% to 5% of sum insured)",
      "Use of technology for quick claim assessment"
    ],
    "documents_required": [
      "Aadhaar card",
      "Land records or tenancy agreement",
      "Bank account details",
      "Sowing declaration"
    ],
    "application_process": [
      "Apply through bank, insurance company, or the national crop insurance portal",
      "Submit land and crop sowing details before the cut-off date",
      "Premium is deducted or paid directly",
      "Claim is triggered automatically for notified calamities"
    ],
    "source": "Ministry of Agriculture & Farmers Welfare, Govt of India (pmfby.gov.in)",
    "url": "https://pmfby.gov.in",
    "last_updated": "2025-11-18",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "edu-001",
    "title": "Samagra Shiksha Abhiyan",
    "category": "Education",
    "description": "An integrated scheme for school education covering pre-school to senior secondary level, aiming at improving school effectiveness and equitable learning outcomes.",
    "eligibility": [
      "Applicable to all government and government-aided schools",
      "Special focus on children with disabilities, girls, and children from disadvantaged groups"
    ],
    "benefits": [
      "Free textbooks and uniforms for eligible students",
      "Infrastructure support including classrooms and toilets",
      "Special training for out-of-school children",
      "Support for children with special needs"
    ],
    "documents_required": [
      "School enrollment record",
      "Aadhaar card (if available)",
      "Disability certificate (if applicable)"
    ],
    "application_process": [
      "No individual application needed; benefits are routed through the school",
      "Parents can confirm eligibility with the school head teacher",
      "District education office can be contacted for grievances"
    ],
    "source": "Department of School Education & Literacy, Ministry of Education (samagra.education.gov.in)",
    "url": "https://samagra.education.gov.in",
    "last_updated": "2025-11-05",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": [
      "Pre-school to Class 12"
    ]
  },
  {
    "id": "edu-002",
    "title": "PM Vidyalaxmi Education Loan Scheme",
    "category": "Education",
    "description": "Collateral-free education loan scheme for students securing admission into top-ranked higher education institutions, with interest subvention for economically weaker students.",
    "eligibility": [
      "Admission into a Quality Higher Education Institution as notified under the scheme",
      "Indian citizen with valid admission letter",
      "Interest subvention applicable for family income up to Rs. 8,00,000 per annum"
    ],
    "benefits": [
      "Loans up to Rs. 10 lakh without collateral",
      "3% interest subvention during the moratorium period for eligible students",
      "Simplified digital application through the portal"
    ],
    "documents_required": [
      "Admission letter",
      "Income certificate",
      "Aadhaar card",
      "Academic mark sheets",
      "Bank KYC documents"
    ],
    "application_process": [
      "Apply on the PM Vidyalaxmi portal",
      "Select participating bank and loan amount",
      "Upload documents for verification",
      "Bank sanctions loan after due diligence"
    ],
    "source": "Department of Higher Education, Ministry of Education (pmvidyalaxmi.gov.in)",
    "url": "https://pmvidyalaxmi.gov.in",
    "last_updated": "2026-01-02",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": [
      "Undergraduate",
      "Postgraduate"
    ]
  },
  {
    "id": "emp-001",
    "title": "PM Kaushal Vikas Yojana (PMKVY)",
    "category": "Employment",
    "description": "Flagship skill development scheme offering short-term training and certification to help youth gain industry-relevant skills for employment.",
    "eligibility": [
      "Indian citizen, generally between 15 and 45 years of age",
      "School or college dropouts and unemployed youth are prioritised",
      "No specific educational qualification required for most short-term courses"
    ],
    "benefits": [
      "Free skill training aligned to National Skill Qualification Framework",
      "Certification recognized across industry",
      "Placement assistance in partner companies",
      "Monetary reward for eligible candidates completing training under RPL"
    ],
    "documents_required": [
      "Aadhaar card",
      "Bank account details",
      "Passport size photograph",
      "Educational certificates (if any)"
    ],
    "application_process": [
      "Locate the nearest PMKVY training centre via the Skill India portal",
      "Register and choose a job role/sector",
      "Attend training and assessment",
      "Receive certification and placement support"
    ],
    "source": "Ministry of Skill Development & Entrepreneurship, Govt of India (pmkvyofficial.org)",
    "url": "https://www.pmkvyofficial.org",
    "last_updated": "2025-12-11",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "emp-002",
    "title": "PM Employment Generation Programme (PMEGP)",
    "category": "Employment",
    "description": "Credit-linked subsidy scheme to help set up micro-enterprises and generate self-employment opportunities.",
    "eligibility": [
      "Individuals above 18 years of age",
      "Minimum Class 8 pass for projects above Rs. 10 lakh (manufacturing) or Rs. 5 lakh (service)",
      "Only new units are eligible; existing units cannot avail this scheme again"
    ],
    "benefits": [
      "Margin money subsidy of 15% to 35% of project cost depending on category and area",
      "Bank loan for the remaining project cost",
      "Support for setting up manufacturing or service micro-enterprises"
    ],
    "documents_required": [
      "Aadhaar card",
      "Project report",
      "Educational qualification proof",
      "Caste/category certificate (if applicable)",
      "Bank loan application documents"
    ],
    "application_process": [
      "Apply online through the PMEGP e-portal",
      "Prepare and submit a detailed project report",
      "Attend interview by the district task force committee",
      "Loan sanction by the identified bank and subsidy release by the implementing agency"
    ],
    "source": "Khadi & Village Industries Commission, Ministry of MSME (kviconline.gov.in)",
    "url": "https://www.kviconline.gov.in",
    "last_updated": "2025-10-30",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "gov-001",
    "title": "Aadhaar Enrollment and Update Services",
    "category": "Government Services",
    "description": "Aadhaar is a 12-digit unique identity number issued by UIDAI, required to access most government schemes and services.",
    "eligibility": [
      "Available to all residents of India, including children",
      "No income or category restriction"
    ],
    "benefits": [
      "Single identity proof accepted across government and private services",
      "Enables direct benefit transfer for subsidies and scholarships",
      "Free updates for demographic details within the prescribed window"
    ],
    "documents_required": [
      "Proof of identity (e.g. passport, PAN, voter ID)",
      "Proof of address (e.g. utility bill, ration card)",
      "Proof of date of birth for new enrollment"
    ],
    "application_process": [
      "Book an appointment at the nearest Aadhaar Seva Kendra or enrollment centre",
      "Carry original documents for verification",
      "Complete biometric capture (fingerprints, iris, photograph)",
      "Aadhaar is generated and dispatched by post, also downloadable online"
    ],
    "source": "Unique Identification Authority of India - UIDAI (uidai.gov.in)",
    "url": "https://uidai.gov.in",
    "last_updated": "2025-09-14",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "gov-002",
    "title": "Income and Caste Certificate Services",
    "category": "Government Services",
    "description": "Income and caste certificates issued by the revenue department are required for scholarships, reservations, and welfare schemes.",
    "eligibility": [
      "Resident of the state applying for the certificate",
      "Caste certificate requires proof of belonging to the specific community"
    ],
    "benefits": [
      "Required document for scholarships, fee reimbursement and reservation benefits",
      "Digitally verifiable certificate in most states"
    ],
    "documents_required": [
      "Aadhaar card",
      "Ration card or residence proof",
      "Self-declaration form",
      "Community certificate of parent (for caste certificate)"
    ],
    "application_process": [
      "Apply through the state e-Seva/Meeseva/Common Service Centre portal",
      "Upload supporting documents",
      "Field verification by revenue officials if required",
      "Certificate issued digitally or physically within stipulated days"
    ],
    "source": "State Revenue Department & Digital Seva Portal (digitalseva.csc.gov.in)",
    "url": "https://digitalseva.csc.gov.in",
    "last_updated": "2025-08-22",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "sch-001",
    "title": "National Means-cum-Merit Scholarship",
    "category": "Scholarships",
    "description": "Financial assistance for meritorious students from economically weaker sections to prevent dropout at the secondary stage and encourage them to continue education.",
    "eligibility": [
      "Student must be studying in class 9 to 12 in a government, government-aided or local body school",
      "Family income should not exceed the notified income ceiling",
      "Student must have scored at least 55% marks in the qualifying examination"
    ],
    "benefits": [
      "Scholarship amount of Rs. 12,000 per year (Rs. 1,000 per month)",
      "Disbursed directly to the student's bank account"
    ],
    "documents_required": [
      "Income certificate",
      "Previous year mark sheet",
      "Aadhaar card",
      "Bank passbook (Aadhaar linked)",
      "School bonafide certificate"
    ],
    "application_process": [
      "Register on the National Scholarship Portal (NSP)",
      "Fill personal, academic and bank details",
      "Upload required documents",
      "Submit application before the deadline",
      "Track status through the portal"
    ],
    "source": "National Scholarship Portal, Ministry of Education, Govt of India (scholarships.gov.in)",
    "url": "https://scholarships.gov.in",
    "last_updated": "2026-01-15",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": [
      "Class 9-12"
    ]
  },
  {
    "id": "sch-002",
    "title": "AICTE Pragati Scholarship for Girl Students",
    "category": "Scholarships",
    "description": "Scholarship scheme to support girl students pursuing technical education (diploma or degree) at AICTE-approved institutions.",
    "eligibility": [
      "Applicant must be a girl student admitted to 1st year of a Degree/Diploma course in an AICTE approved institution",
      "Only two girl children per family are eligible",
      "Family annual income should not exceed Rs. 8,00,000"
    ],
    "benefits": [
      "Rs. 50,000 per annum for tuition fee and other essentials",
      "Coverage for the entire duration of the course, subject to satisfactory academic performance"
    ],
    "documents_required": [
      "Admission proof",
      "Income certificate",
      "Aadhaar card",
      "Bank account details",
      "Passing certificate of qualifying exam"
    ],
    "application_process": [
      "Apply through the National Scholarship Portal under AICTE schemes",
      "Fill in institution and course details",
      "Upload the required certificates",
      "Verification by the institution nodal officer",
      "Disbursal after state/AICTE approval"
    ],
    "source": "All India Council for Technical Education - AICTE (scholarships.gov.in)",
    "url": "https://scholarships.gov.in",
    "last_updated": "2026-01-10",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": [
      "B.Tech",
      "Diploma",
      "Degree"
    ]
  },
  {
    "id": "sch-003",
    "title": "Andhra Pradesh Vidya Deevena (Fee Reimbursement)",
    "category": "Scholarships",
    "description": "State scheme reimbursing tuition fees for students pursuing Intermediate, Degree, Engineering, Medical and other professional courses in Andhra Pradesh.",
    "eligibility": [
      "Student must be a resident of Andhra Pradesh",
      "Family annual income should be below Rs. 2,50,000 (rural) or applicable urban ceiling",
      "Admission in a recognized government or private college within AP"
    ],
    "benefits": [
      "Full or partial reimbursement of tuition fees directly to college",
      "Applicable across Intermediate, Degree, B.Tech, and professional courses"
    ],
    "documents_required": [
      "Income and caste certificate",
      "Aadhaar card",
      "College admission and fee receipt",
      "Ration card",
      "Bank passbook"
    ],
    "application_process": [
      "Apply through the AP Government Jnanabhumi portal",
      "Enter Aadhaar and family details for verification",
      "College nodal officer confirms enrollment",
      "Fee is reimbursed directly to the institution"
    ],
    "source": "Higher Education Department, Government of Andhra Pradesh (navasakam.ap.gov.in)",
    "url": "https://navasakam.ap.gov.in",
    "last_updated": "2025-12-20",
    "language": "en",
    "states": [
      "Andhra Pradesh"
    ],
    "education_level": [
      "Intermediate",
      "B.Tech",
      "Degree",
      "Medical"
    ]
  },
  {
    "id": "wel-001",
    "title": "Ayushman Bharat - PM Jan Arogya Yojana",
    "category": "Welfare",
    "description": "Health insurance scheme providing cashless treatment coverage to economically vulnerable families at empanelled hospitals.",
    "eligibility": [
      "Families identified as deprived under the Socio-Economic Caste Census",
      "No cap on family size or age of members"
    ],
    "benefits": [
      "Health cover of Rs. 5 lakh per family per year",
      "Cashless and paperless treatment at empanelled public and private hospitals",
      "Covers pre and post hospitalization expenses"
    ],
    "documents_required": [
      "Aadhaar card",
      "Ration card",
      "SECC verification document or Ayushman card"
    ],
    "application_process": [
      "Check eligibility on the Ayushman Bharat portal or nearest Common Service Centre",
      "Generate the Ayushman Card (e-KYC through Aadhaar)",
      "Present the card at an empanelled hospital for cashless treatment"
    ],
    "source": "National Health Authority, Ministry of Health & Family Welfare (nha.gov.in)",
    "url": "https://nha.gov.in",
    "last_updated": "2025-12-05",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  },
  {
    "id": "wel-002",
    "title": "National Social Assistance Programme - Old Age Pension",
    "category": "Welfare",
    "description": "Monthly pension support for senior citizens belonging to below poverty line households.",
    "eligibility": [
      "Applicant must be 60 years of age or above",
      "Belong to a household identified as below poverty line",
      "No other regular pension or family support"
    ],
    "benefits": [
      "Monthly pension amount (varies by state, typically Rs. 200 to Rs. 2000)",
      "Direct transfer to bank or post office account"
    ],
    "documents_required": [
      "Age proof",
      "BPL certificate",
      "Aadhaar card",
      "Bank/post office account details"
    ],
    "application_process": [
      "Apply at the gram panchayat, municipal office or social welfare department",
      "Submit age and income proof for verification",
      "Approved applications are added to the pension disbursal list"
    ],
    "source": "Ministry of Rural Development, Govt of India (nsap.nic.in)",
    "url": "https://nsap.nic.in",
    "last_updated": "2025-07-19",
    "language": "en",
    "states": [
      "All India"
    ],
    "education_level": []
  }
];

export const SCHEME_TRANSLATIONS: Record<string, Record<string, any>> = {
  "te": {
    "sch-001": {
      "title": "నేషనల్ మీన్స్-కమ్-మెరిట్ స్కాలర్‌షిప్ (NMMSS)",
      "summary": "ఆర్థికంగా వెనుకబడిన ప్రతిభావంతులైన విద్యార్థులకు 9వ తరగతి నుండి 12వ తరగతి వరకు సంవత్సరానికి ₹12,000 స్కాలర్‌షిప్ అందించే కేంద్ర ప్రభుత్వ పథకం.",
      "eligibility": [
        "7వ తరగతి పరీక్షలో కనీసం 55% మార్కులు సాధించిన విద్యార్థులు (SC/ST లకు 50%).",
        "ప్రభుత్వ, స్థానిక సంస్థల లేదా ప్రభుత్వ ఎయిడెడ్ పాఠశాలల్లో 8వ తరగతి చదువుతున్న విద్యార్థులు.",
        "కుటుంబ వార్షిక ఆదాయం ₹3,50,000 మించకూడదు."
      ],
      "benefits": [
        "సంవత్సరానికి ₹12,000 (నెలకు ₹1,000 చొప్పున) నేరుగా విద్యార్థి బ్యాంక్ ఖాతాలో జమ చేయబడుతుంది.",
        "9 నుండి 12వ తరగతి వరకు 4 సంవత్సరాల పాటు నిరంతర ఆర్థిక సహాయం."
      ],
      "documents_required": [
        "7వ తరగతి మార్కుల జాబితా",
        "కుటుంబ ఆదాయ ధృవీకరణ పత్రం",
        "కుల ధృవీకరణ పత్రం (వర్తిస్తే)",
        "ఆధార్ కార్డు మరియు బ్యాంక్ పాస్‌బుక్ వివరాలు"
      ],
      "application_process": [
        "రాష్ట్ర స్థాయి NMMSS ప్రవేశ పరీక్షకు పాఠశాల ప్రధానోపాధ్యాయుల ద్వారా దరఖాస్తు చేసుకోండి.",
        "ఎంపికైన విద్యార్థులు నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (NSP - scholarships.gov.in) లో నమోదు చేసుకోవాలి."
      ]
    },
    "sch-002": {
      "title": "AICTE ప్రగతి స్కాలర్‌షిప్ (బాలికల కోసం)",
      "summary": "టెక్నికల్ డిగ్రీ లేదా డిప్లొమా చదువుతున్న బాలికల విద్యకు ప్రోత్సాహంగా సంవత్సరానికి ₹50,000 అందించే పథకం.",
      "eligibility": [
        "AICTE గుర్తింపు పొందిన కళాశాలలో ఇంజనీరింగ్ డిగ్రీ లేదా డిప్లొమా మొదటి సంవత్సరంలో ప్రవేశం పొందిన బాలికలు.",
        "కుటుంబ వార్షిక ఆదాయం ₹8 లక్షల కంటే తక్కువ ఉండాలి.",
        "కుటుంబంలో గరిష్టంగా ఇద్దరు బాలికలకు మాత్రమే వర్తిస్తుంది."
      ],
      "benefits": [
        "బోధనా రుసుము, పుస్తకాలు మరియు లాప్‌టాప్ ఖర్చుల కోసం సంవత్సరానికి ₹50,000 ఆర్థిక సాయం."
      ],
      "documents_required": [
        "10వ మరియు 12వ తరగతి మార్కుల జాబితాలు",
        "కాలేజ్ అడ్మిషన్ లెటర్ మరియు ఫీజు రసీదు",
        "తహశీల్దార్ జారీ చేసిన ఆదాయ ధృవీకరణ పత్రం",
        "ఆధార్ కార్డు మరియు బ్యాంక్ ఖాతా వివరాలు"
      ],
      "application_process": [
        "నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (NSP) ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోవాలి.",
        "కాలేజ్ ద్వారా డాక్యుమెంట్ వెరిఫికేషన్ పూర్తి చేయించుకోవాలి."
      ]
    },
    "sch-003": {
      "title": "జగనన్న విద్యా దీవెన (ఫీజు రీయింబర్స్‌మెంట్)",
      "summary": "ఆంధ్రప్రదేశ్ ప్రభుత్వం ఐటీఐ, పాలిటెక్నిక్, డిగ్రీ, ఇంజనీరింగ్ మరియు మెడిసిన్ చదివే పేద విద్యార్థుల పూర్తి కళాశాల ఫీజును రీయింబర్స్ చేస్తుంది.",
      "eligibility": [
        "ఆంధ్రప్రదేశ్ రాష్ట్రంలో గుర్తింపు పొందిన కాలేజీలలో ఉన్నత విద్య చదువుతున్న విద్యార్థులు.",
        "కుటుంబ వార్షిక ఆదాయం ₹2.50 లక్షలలోపు ఉండాలి.",
        "కుటుంబంలో 4 చక్రాల వాహనం (టాక్సీ/ట్రాక్టర్ మినహా) ఉండకూడదు."
      ],
      "benefits": [
        "100% పూర్తి కళాశాల ట్యూషన్ ఫీజు నేరుగా విద్యార్థి తల్లి బ్యాంక్ ఖాతాలో 4 విడతల్లో జమ."
      ],
      "documents_required": [
        "రైస్ కార్డు (రేషన్ కార్డు) లేదా ఆదాయ ధృవీకరణ పత్రం",
        "విద్యార్థి మరియు తల్లి ఆధార్ కార్డులు",
        "కాలేజ్ అడ్మిషన్ మరియు హాజరు వివరాలు (కనీసం 75% హాజరు)",
        "తల్లి బ్యాంక్ పాస్‌బుక్ వివరాలు"
      ],
      "application_process": [
        "గ్రామ/వార్డు సచివాలయంలో ఎడ్యుకేషన్ అసిస్టెంట్ ద్వారా దరఖాస్తు సమర్పించాలి.",
        "జ్ఞానభూమి పోర్టల్ (jnanabhumi.ap.gov.in) ద్వారా కాలేజ్ ధృవీకరణ జరుగుతుంది."
      ]
    },
    "agr-001": {
      "title": "పీఎం కిసాన్ సమ్మాన్ నిధి (PM-KISAN)",
      "summary": "దేశంలోని సన్నకారు, చిన్నకారు రైతు కుటుంబాలకు వ్యవసాయ పెట్టుబడి సహాయంగా సంవత్సరానికి ₹6,000 అందించే కేంద్ర ప్రభుత్వ పథకం.",
      "eligibility": [
        "తన పేరిట సాగు భూమి ఉన్న రైతు కుటుంబాలన్నీ అర్హులు.",
        "సంస్థాగత భూ యజమానులు, ప్రభుత్వ ఉద్యోగులు మరియు ఆదాయపు పన్ను చెల్లించేవారు అర్హులు కారు."
      ],
      "benefits": [
        "సంవత్సరానికి ₹6,000 ఆర్థిక సహాయం, ప్రతి నాలుగు నెలలకు ₹2,000 చొప్పున 3 విడతల్లో నేరుగా బ్యాంక్ ఖాతాలో జమ."
      ],
      "documents_required": [
        "ఆధార్ కార్డు",
        "వ్యవసాయ భూమి పట్టాదారు పాస్‌బుక్ / రికార్డ్ ఆఫ్ రైట్స్ (ROR)",
        "బ్యాంక్ ఖాతా వివరాలు మరియు మొబైల్ నంబర్"
      ],
      "application_process": [
        "pmkisan.gov.in పోర్టల్‌లో న్యూ ఫార్మర్ రిజిస్ట్రేషన్ ద్వారా లేదా మీసేవా/CSC కేంద్రంలో దరఖాస్తు చేసుకోవాలి."
      ]
    },
    "agr-002": {
      "title": "ప్రధాన మంత్రి ఫసల్ బీమా యోజన (PMFBY)",
      "summary": "వర్షాభావం, తెగుళ్లు లేదా ప్రకృతి వైపరీత్యాల వల్ల పంట నష్టపోయిన రైతులకు సమగ్ర పంట బీమా రక్షణ కల్పించే పథకం.",
      "eligibility": [
        "నోటిఫైడ్ ప్రాంతాల్లో నోటిఫైడ్ పంటలను సాగు చేస్తున్న వాటాదారులు, కౌలు రైతులు మరియు యజమానులందరూ అర్హులు."
      ],
      "benefits": [
        "ఖరీఫ్ పంటలకు కేవలం 2%, రబీ పంటలకు 1.5%, వాణిజ్య పంటలకు 5% నామమాత్రపు ప్రీమియంతో పూర్తి పంట నష్టపరిహారం."
      ],
      "documents_required": [
        "ఆధార్ కార్డు",
        "భూమి పట్టాదారు పాస్‌బుక్ లేదా కౌలు ఒప్పంద పత్రం",
        "విత్తనాలు వేసిన ధృవీకరణ పత్రం (గ్రామ వ్యవసాయ అధికారి నుండి)",
        "బ్యాంక్ పాస్‌బుక్"
      ],
      "application_process": [
        "బ్యాంక్ శాఖ, సహకార సంఘం లేదా pmfby.gov.in ద్వారా కటాఫ్ తేదీకి ముందే ప్రీమియం చెల్లించి నమోదు చేసుకోవాలి."
      ]
    },
    "edu-001": {
      "title": "సమగ్ర శిక్షా అభియాన్",
      "summary": "ప్రీ-స్కూల్ నుండి 12వ తరగతి వరకు పాఠశాల విద్య నాణ్యతను మెరుగుపరచడం మరియు ఉచిత పాఠ్యపుస్తకాలు, యూనిఫారాలు అందించే కార్యక్రమం.",
      "eligibility": [
        "ప్రభుత్వ మరియు ఎయిడెడ్ పాఠశాలల్లో 1వ తరగతి నుండి 12వ తరగతి వరకు చదువుతున్న విద్యార్థులందరూ అర్హులు."
      ],
      "benefits": [
        "ఉచిత పాఠ్యపుస్తకాలు, యూనిఫారాలు, మధ్యాహ్న భోజనం మరియు ప్రత్యేక అవసరాలు గల పిల్లలకు ఉపకార వేతనాలు."
      ],
      "documents_required": [
        "పాఠశాల ప్రవేశ రికార్డు",
        "విద్యార్థి ఆధార్ కార్డు"
      ],
      "application_process": [
        "ప్రభుత్వ పాఠశాలలో ప్రవేశం పొందిన వెంటనే ఆటోమేటిక్‌గా పాఠశాల ప్రధానోపాధ్యాయుల ద్వారా సదుపాయాలు లభిస్తాయి."
      ]
    },
    "edu-002": {
      "title": "పీఎం విద్యాలక్ష్మి ఎడ్యుకేషన్ లోన్ పోర్టల్",
      "summary": "భారతదేశంలో లేదా విదేశాలలో ఉన్నత విద్య అభ్యసించడానికి సులభంగా విద్యా రుణాలు మరియు ప్రభుత్వ వడ్డీ రాయితీ పొందే ఒకే వేదిక.",
      "eligibility": [
        "గుర్తింపు పొందిన ఉన్నత విద్యా కోర్సుల్లో అడ్మిషన్ పొందిన భారతీయ పౌరులు."
      ],
      "benefits": [
        "₹7.5 లక్షల వరకు ఎలాంటి తనఖా లేకుండా రుణాలు, ఆర్థికంగా వెనుకబడిన విద్యార్థులకు మారటోరియం కాలంలో పూర్తి వడ్డీ రాయితీ."
      ],
      "documents_required": [
        "అడ్మిషన్ అలాట్‌మెంట్ ఆర్డర్ మరియు ఫీజు వివరాలు",
        "10వ, ఇంటర్ మార్కుల పత్రాలు",
        "ఆదాయ ధృవీకరణ పత్రం మరియు పాన్ కార్డు"
      ],
      "application_process": [
        "vidyalakshmi.co.in లో లాగిన్ అయి కామన్ ఎడ్యుకేషన్ లోన్ అప్లికేషన్ ఫారం (CELAF) నింపి బ్యాంకులకి దరఖాస్తు చేసుకోవాలి."
      ]
    },
    "emp-001": {
      "title": "ప్రధాన మంత్రి కౌశల్ వికాస్ యోజన (PMKVY)",
      "summary": "యువతకు ఉచిత నైపుణ్య శిక్షణ, ప్రభుత్వ ధృవీకరణ పత్రం మరియు ఉపాధి అవకాశాలు కల్పించే నైపుణ్యాభివృద్ధి కార్యక్రమం.",
      "eligibility": [
        "చదువు మధ్యలో ఆపేసిన నిరుద్యోగ యువత లేదా నైపుణ్యాలు పెంచుకోవాలనుకునే 15 నుండి 45 ఏళ్ల భారతీయ పౌరులు."
      ],
      "benefits": [
        "పూర్తిగా ఉచిత శిక్షణ, NSQF సర్టిఫికేషన్ మరియు సర్టిఫికేట్ పొందిన వారికి ₹8,000 వరకు గౌరవ వేతనం మరియు జాబ్ ప్లేస్‌మెంట్."
      ],
      "documents_required": [
        "ఆధార్ కార్డు",
        "విద్యార్హత ధృవీకరణ పత్రాలు",
        "బ్యాంక్ ఖాతా వివరాలు"
      ],
      "application_process": [
        "pmkvyofficial.org లో సమీప శిక్షణా కేంద్రాన్ని ఎంచుకుని నమోదు చేసుకోవాలి."
      ]
    },
    "emp-002": {
      "title": "పీఎం ఎంప్లాయ్‌మెంట్ జనరేషన్ ప్రోగ్రామ్ (PMEGP)",
      "summary": "కొత్త వ్యాపారాలు లేదా సూక్ష్మ పరిశ్రమలు స్థాపించడానికి 35% వరకు ప్రభుత్వ రాయితీతో ₹50 లక్షల వరకు రుణం అందించే పథకం.",
      "eligibility": [
        "18 ఏళ్లు పైబడిన భారతీయ పౌరులు. తయారీ రంగంలో ₹10 లక్షలు, సేవా రంగంలో ₹5 లక్షలు పైబడిన ప్రాజెక్టులకు 8వ తరగతి ఉత్తీర్ణత తప్పనిసరి."
      ],
      "benefits": [
        "తయారీ రంగానికి ₹50 లక్షలు, సేవా రంగానికి ₹20 లక్షల వరకు రుణం. గ్రామీణ ప్రాంతాల్లో 25% నుండి 35% వరకు ప్రభుత్వం నుండి రాయితీ."
      ],
      "documents_required": [
        "ప్రాజెక్ట్ రిపోర్ట్ (DPR)",
        "ఆధార్, పాన్ కార్డు మరియు విద్యా అర్హత పత్రాలు",
        "కుల ధృవీకరణ పత్రం (వర్తిస్తే)"
      ],
      "application_process": [
        "kviconline.gov.in పోర్టల్ ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు సమర్పించాలి."
      ]
    },
    "gov-001": {
      "title": "ఆధార్ నమోదు మరియు అప్‌డేట్ సేవలు",
      "summary": "ప్రతి భారతీయ పౌరుడికి 12 అంకెల విశిష్ట గుర్తింపు సంఖ్యను జారీ చేసే మరియు బయోమెట్రిక్/చిరునామా మార్పులు చేసుకునే అధికారిక సేవ.",
      "eligibility": [
        "గత 12 నెలల్లో కనీసం 182 రోజులు భారతదేశంలో నివసించిన నివాసితులందరూ అర్హులు."
      ],
      "benefits": [
        "అన్ని ప్రభుత్వ సంక్షేమ పథకాలు, సబ్సిడీలు మరియు బ్యాంక్ సేవలకు ఏకైక ప్రామాణిక డిజిటల్ గుర్తింపు."
      ],
      "documents_required": [
        "గుర్తింపు రుజువు (POI), చిరునామా రుజువు (POA), పుట్టిన తేదీ రుజువు (DOB)"
      ],
      "application_process": [
        "సమీప ఆధార్ సేవా కేంద్రం లేదా పోస్టాఫీసులో బయోమెట్రిక్స్ ఇచ్చి నమోదు చేసుకోవాలి."
      ]
    },
    "gov-002": {
      "title": "ఆదాయ మరియు కుల ధృవీకరణ పత్రాల సేవలు",
      "summary": "ప్రభుత్వ ఉద్యోగాలు, విద్యా ప్రవేశాలు మరియు సంక్షేమ పథకాల కోసం తహశీల్దార్ కార్యాలయం జారీ చేసే అధికారిక ధృవీకరణ పత్రాలు.",
      "eligibility": [
        "సంబంధిత రాష్ట్రంలో నివసిస్తున్న పౌరులందరూ వారి వాస్తవ ఆదాయం మరియు సామాజిక వర్గం ప్రకారం అర్హులు."
      ],
      "benefits": [
        "ఫీజు రీయింబర్స్‌మెంట్, రిజర్వేషన్లు, స్కాలర్‌షిప్‌లు మరియు ప్రభుత్వ సబ్సిడీలను పొందడానికి తప్పనిసరి."
      ],
      "documents_required": [
        "ఆధార్ కార్డు",
        "రేషన్ కార్డు లేదా వోటర్ ఐడీ",
        "పాత కుల ధృవీకరణ పత్రం లేదా కుటుంబ సభ్యుల రికార్డు",
        "స్వయం ధృవీకరణ పత్రం"
      ],
      "application_process": [
        "మీసేవా లేదా గ్రామ/వార్డు సచివాలయంలో ఆన్‌లైన్ దరఖాస్తు సమర్పించాలి."
      ]
    },
    "wel-001": {
      "title": "ఆయుష్మాన్ భారత్ - పీఎం జన్ ఆరోగ్య యోజన (AB-PMJAY)",
      "summary": "పేద కుటుంబాలకు ద్వితీయ మరియు తృతీయ స్థాయి ఆసుపత్రి చికిత్సల కోసం సంవత్సరానికి ₹5 లక్షల వరకు ఉచిత నగదు రహిత ఆరోగ్య బీమా.",
      "eligibility": [
        "SECC 2011 డేటాబేస్ ప్రకారం గుర్తించబడిన పేద, అల్పాదాయ కుటుంబాలన్నీ అర్హులు."
      ],
      "benefits": [
        "దేశవ్యాప్తంగా ఎంప్లానెల్డ్ ఆసుపత్రులలో కుటుంబానికి సంవత్సరానికి ₹5 లక్షల వరకు ఉచిత చికిత్స."
      ],
      "documents_required": [
        "ఆధార్ కార్డు",
        "రేషన్ కార్డు లేదా పీఎం-జేవై కుటుంబ లేఖ"
      ],
      "application_process": [
        "సమీప ప్రభుత్వ ఆసుపత్రి లేదా CSC కేంద్రంలో ఆయుష్మాన్ కార్డు ఉచితంగా పొందవచ్చు."
      ]
    },
    "wel-002": {
      "title": "జాతీయ సామాజిక సహాయ కార్యక్రమం - వృద్ధాప్య పింఛను (IGNOAPS)",
      "summary": "దారిద్య్రరేఖకు దిగువన ఉన్న 60 ఏళ్లు పైబడిన నిరుపేద వృద్ధులకు ప్రతి నెలా అందించే జీవన భృతి పింఛను.",
      "eligibility": [
        "60 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ వయస్సు ఉన్న దారిద్య్రరేఖకు దిగువన (BPL) ఉన్న పౌరులు."
      ],
      "benefits": [
        "నెలవారీ గౌరవ పింఛను నేరుగా లబ్ధిదారుడి బ్యాంక్ ఖాతాలో లేదా ఇంటి వద్దే పంపిణీ."
      ],
      "documents_required": [
        "వయస్సు ధృవీకరణ పత్రం లేదా ఆధార్ కార్డు",
        "BPL కార్డు / రేషన్ కార్డు",
        "బ్యాంక్ ఖాతా వివరాలు"
      ],
      "application_process": [
        "గ్రామ పంచాయితీ, సచివాలయం లేదా మున్సిపల్ కార్యాలయంలో దరఖాస్తు చేసుకోవాలి."
      ]
    }
  },
  "hi": {
    "sch-001": {
      "title": "राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति (NMMSS)",
      "summary": "कक्षा 9 से 12 तक पढ़ने वाले आर्थिक रूप से कमजोर मेधावी छात्रों को ₹12,000 प्रति वर्ष की छात्रवृत्ति प्रदान करने वाली केंद्र सरकार की योजना।",
      "eligibility": [
        "कक्षा 7 की परीक्षा में कम से कम 55% अंक प्राप्त करने वाले छात्र (SC/ST के लिए 50%)।",
        "सरकारी या सहायता प्राप्त स्कूलों में कक्षा 8 में अध्ययनरत छात्र।",
        "परिवार की वार्षिक आय ₹3,50,000 से अधिक नहीं होनी चाहिए।"
      ],
      "benefits": [
        "₹12,000 प्रति वर्ष सीधे छात्र के बैंक खाते में जमा किए जाते हैं।",
        "कक्षा 9 से 12 तक 4 वर्षों के लिए निरंतर वित्तीय सहायता।"
      ],
      "documents_required": [
        "कक्षा 7 की अंकतालिका",
        "आय प्रमाण पत्र",
        "जाति प्रमाण पत्र (यदि लागू हो)",
        "आधार कार्ड और बैंक खाता विवरण"
      ],
      "application_process": [
        "स्कूल के माध्यम से राज्य स्तरीय NMMSS परीक्षा के लिए आवेदन करें।",
        "चयनित छात्र नेशनल स्कॉलरशिप पोर्टल (scholarships.gov.in) पर पंजीकरण करें।"
      ]
    },
    "agr-001": {
      "title": "पीएम किसान सम्मान निधि (PM-KISAN)",
      "summary": "देश के सभी पात्र किसान परिवारों को कृषि इनपुट और घरेलू खर्चों के लिए प्रति वर्ष ₹6,000 की वित्तीय सहायता।",
      "eligibility": [
        "जिन किसानों के नाम पर कृषि योग्य भूमि पंजीकृत है वे सभी पात्र हैं।"
      ],
      "benefits": [
        "₹6,000 प्रति वर्ष, ₹2,000 की तीन समान किस्तों में सीधे बैंक खाते में।"
      ],
      "documents_required": [
        "आधार कार्ड",
        "जमीन की खतौनी / भू-अभिलेख दस्तावेज",
        "बैंक खाता और मोबाइल नंबर"
      ],
      "application_process": [
        "pmkisan.gov.in पर न्यू फार्मर रजिस्ट्रेशन के जरिए ऑनलाइन आवेदन करें।"
      ]
    },
    "wel-001": {
      "title": "आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)",
      "summary": "गरीब और कमजोर परिवारों को गंभीर बीमारियों के इलाज के लिए प्रति वर्ष ₹5 लाख तक का मुफ्त कैशलेस स्वास्थ्य बीमा।",
      "eligibility": [
        "SECC 2011 डेटाबेस के अनुसार पहचाने गए सभी कमजोर और ग्रामीण परिवार पात्र हैं।"
      ],
      "benefits": [
        "सूचीबद्ध अस्पतालों में माध्यमिक और तृतीयक देखभाल के लिए प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस इलाज।"
      ],
      "documents_required": [
        "आधार कार्ड",
        "राशन कार्ड"
      ],
      "application_process": [
        "निकटतम कॉमन सर्विस सेंटर (CSC) या सरकारी अस्पताल में आयुष्मान कार्ड बनवाएं।"
      ]
    }
  },
  "kn": {
    "sch-001": {
      "title": "ರಾಷ್ಟ್ರೀಯ ಸಾಧನ-ಮತ್ತು-ಮೆರಿಟ್ ವಿದ್ಯಾರ್ಥಿವೇತನ (NMMSS)",
      "summary": "ಆರ್ಥಿಕವಾಗಿ ಹಿಂದುಳಿದ ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ 9 ರಿಂದ 12 ನೇ ತರಗತಿಯವರೆಗೆ ವರ್ಷಕ್ಕೆ ₹12,000 ವಿದ್ಯಾರ್ಥಿವೇತನ ನೀಡುವ ಕೇಂದ್ರ ಸರ್ಕಾರದ ಯೋಜನೆ.",
      "eligibility": [
        "7 ನೇ ತರಗತಿಯ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಕನಿಷ್ಠ 55% ಅಂಕಗಳನ್ನು ಪಡೆದಿರಬೇಕು (SC/ST ಗೆ 50%).",
        "ಸರ್ಕಾರಿ ಅಥವಾ ಅನುದಾನಿತ ಶಾಲೆಗಳಲ್ಲಿ 8 ನೇ ತರಗತಿಯಲ್ಲಿ ಕಲಿಯುತ್ತಿರುವ ವಿದ್ಯಾರ್ಥಿಗಳು.",
        "ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ₹3,50,000 ಮೀರಬಾರದು."
      ],
      "benefits": [
        "ವರ್ಷಕ್ಕೆ ₹12,000 ನೇರವಾಗಿ ವಿದ್ಯಾರ್ಥಿಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ."
      ],
      "documents_required": [
        "7 ನೇ ತರಗತಿಯ ಅಂಕಪಟ್ಟಿ",
        "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
        "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ",
        "ಆಧಾರ್ ಕಾರ್ಡ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್"
      ],
      "application_process": [
        "ಶಾಲೆಯ ಮೂಲಕ NMMSS ಪರೀಕ್ಷೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ, ಆಯ್ಕೆಯಾದ ನಂತರ ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ."
      ]
    },
    "agr-001": {
      "title": "ಪಿಎಂ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ (PM-KISAN)",
      "summary": "ದೇಶದ ಎಲ್ಲಾ ಅರ್ಹ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಕೃಷಿ ವೆಚ್ಚಗಳಿಗಾಗಿ ವಾರ್ಷಿಕವಾಗಿ ₹6,000 ಆರ್ಥಿಕ ನೆರವು ನೀಡುವ ಯೋಜನೆ.",
      "eligibility": [
        "ತಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಸಾಗುವಳಿ ಭೂಮಿ ಹೊಂದಿರುವ ರೈತ ಕುಟುಂಬಗಳು ಅರ್ಹರು."
      ],
      "benefits": [
        "ವರ್ಷಕ್ಕೆ ₹6,000 ಆರ್ಥಿಕ ನೆರವು, 3 ಕಂತುಗಳಲ್ಲಿ ತಲಾ ₹2,000 ರಂತೆ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ."
      ],
      "documents_required": [
        "ಆಧಾರ್ ಕಾರ್ಡ್",
        "ಭೂಮಿ ಪಹಣಿ / ಆರ್‌ಟಿಸಿ (RTC)",
        "ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು"
      ],
      "application_process": [
        "pmkisan.gov.in ಪೋರ್ಟಲ್ ಮೂಲಕ ಅಥವಾ ಗ್ರಾಮ ಒನ್ / ಸಿಎಸ್‌ಸಿ ಕೇಂದ್ರಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ."
      ]
    },
    "wel-001": {
      "title": "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಪ್ರಧಾನ ಮಂತ್ರಿ ಜನ ಆರೋಗ್ಯ ಯೋಜನೆ (PM-JAY)",
      "summary": "ಬಡ ಕುಟುಂಬಗಳಿಗೆ ಗಂಭೀರ ಕಾಯಿಲೆಗಳ ಚಿಕಿತ್ಸೆಗಾಗಿ ವರ್ಷಕ್ಕೆ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ನಗದು ರಹಿತ ಆರೋಗ್ಯ ವಿಮೆ.",
      "eligibility": [
        "SECC 2011 ದತ್ತಾಂಶದ ಪ್ರಕಾರ ಗುರುತಿಸಲಾದ ಬಡ ಕುಟುಂಬಗಳು ಅರ್ಹರು."
      ],
      "benefits": [
        "ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ಚಿಕಿತ್ಸೆ ಮತ್ತು ನಗದು ರಹಿತ ಸೇವೆ."
      ],
      "documents_required": [
        "ಆಧಾರ್ ಕಾರ್ಡ್",
        "ಪಡಿತರ ಚೀಟಿ (ರೇಷನ್ ಕಾರ್ಡ್)"
      ],
      "application_process": [
        "ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ಅಥವಾ ಸಿಎಸ್‌ಸಿ ಕೇಂದ್ರಗಳಲ್ಲಿ ಆಯುಷ್ಮಾನ್ ಕಾರ್ಡ್ ಪಡೆದುಕೊಳ್ಳಿ."
      ]
    }
  }
};
