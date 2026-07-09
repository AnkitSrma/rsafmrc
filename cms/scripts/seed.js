// One-time migration seed: creates Global Settings, Posts, and Pages in
// Strapi matching the original static site's real content exactly (see
// the migration plan, Phase 3). Not meant to be re-run against real data —
// safe to run once against a fresh local instance.
//
// Auth note: writes go through the admin-authenticated Content Manager API
// (/content-manager/...), not the public /api/... REST API — admin JWTs
// aren't valid against the users-permissions-guarded public routes, and
// this avoids having to grant the Public role temporary write access.

const fs = require("fs");
const path = require("path");

const BASE = process.env.STRAPI_URL || "http://localhost:1337";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "dev@rsafmrc.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "DevPass123!";

async function login() {
  const res = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status}`);
  const { data } = await res.json();
  return data.token;
}

async function uploadFile(token, filePath, mime) {
  const buf = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("files", new Blob([buf], { type: mime }), path.basename(filePath));
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed for ${filePath}: ${res.status} ${await res.text()}`);
  const [file] = await res.json();
  return file;
}

async function cmRequest(token, method, urlPath, body) {
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${urlPath} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function createAndPublish(token, uid, data) {
  const created = await cmRequest(token, "POST", `/content-manager/collection-types/${uid}`, data);
  const documentId = created.data.documentId;
  await cmRequest(token, "POST", `/content-manager/collection-types/${uid}/${documentId}/actions/publish`);
  return documentId;
}

async function main() {
  const token = await login();
  console.log("Logged in as", ADMIN_EMAIL);

  const logo = await uploadFile(
    token,
    path.resolve(__dirname, "../../assets/logo-mark.png"),
    "image/png"
  );
  const placeholder = await uploadFile(
    token,
    path.resolve(__dirname, "../../assets/images/placeholder-draft.svg"),
    "image/svg+xml"
  );
  console.log("Uploaded logo + placeholder image");

  // ---- Global Settings (single type, no publish step needed) ----
  await cmRequest(token, "PUT", "/content-manager/single-types/api::global-setting.global-setting", {
    siteName: "Regional South Asia Fire Management Resource Center",
    shortName: "RSAFMRC",
    logo: logo.id,
    footerContactLine: "Convening country: Nepal (Department of Forests) · Secretariat: GFMC",
    memberCountries: [
      { name: "Bangladesh" },
      { name: "Bhutan" },
      { name: "India" },
      { name: "Nepal", note: "convening country" },
      { name: "Sri Lanka" },
    ],
  });
  console.log("Global settings saved");

  // ---- Posts ----
  const posts = [
    {
      title: "Working Group on Wildland Fire established",
      slug: "working-group-wildland-fire-2001",
      date: "2001-01-01",
      tags: ["UN-ISDR", "Working Group", "GFMC"],
      featured: false,
      body: [
        "In 2001, the UN-ISDR Inter-Agency Task Force for Disaster Reduction established a Working Group on Wildland Fire, known as WG-4, coordinated by the Global Fire Monitoring Center (GFMC). The group was formed in response to the strategic goals of several international agreements, including the UN Convention on Combat of Desertification, the Convention on Biological Diversity, the UN Framework Convention on Climate Change, the Ramsar Convention on Wetlands, and the UN Forum on Forests.",
        "One of the priority fields addressed by the Working Group was the establishment of, and operational procedures for, a global network of regional- to national-level focal points and network structures for early warning of wildland fire, fire monitoring, and impact assessment.",
        "At its second meeting, held 3–4 December 2001, the Working Group decided to give priority to the establishment of a “Global Network of Regional Wildland Fire Networks” — the initiative that would eventually lead to the founding of the Regional South Asia Wildland Fire Network six years later.",
      ].join("\n\n"),
    },
    {
      title: "Global Wildland Fire Network created",
      slug: "global-wildland-fire-network-2002",
      date: "2002-01-01",
      tags: ["GFMC", "UNISDR", "Global Network"],
      featured: false,
      body: [
        "The UNISDR Global Wildland Fire Network was created in 2002, growing out of the work of the UN-ISDR Inter-Agency Task Force's Working Group on Wildland Fire (WG-4). It was formally recognized as an activity of UNISDR in 2004.",
        "The Global Fire Monitoring Center (GFMC) serves as secretariat of the Global Wildland Fire Network and of the Wildland Fire Advisory Group of the UN International Strategy for Disaster Reduction (UNISDR).",
        "The network's purpose is to enhance existing global fire monitoring capabilities and to facilitate a global fire management working programme, bringing together regional networks such as the one later established for South Asia.",
      ].join("\n\n"),
    },
    {
      title: "International Wildland Fire Summit, Sydney",
      slug: "international-wildland-fire-summit-2003",
      date: "2003-10-03",
      tags: ["Sydney", "Summit", "International Cooperation"],
      featured: false,
      body: [
        "The International Wildland Fire Summit was held in Sydney, Australia, from 3–6 and 8 October 2003. Delegates agreed on a “Strategy for Future Development of International Cooperation in Wildland Fire Management.”",
        "The strategy included an agreement that Regional Wildland Fire Networks would be consolidated, developed, and promoted through active networking in information sharing, capacity building, and the preparation of bilateral and multilateral agreements.",
        "This process was to be facilitated through regional Wildland Fire Conferences and Summits, in cooperation with the International Liaison Committee and the UN-ISDR Working Group on Wildland Fire — the same working group that would later help establish the Regional South Asia Wildland Fire Network.",
      ].join("\n\n"),
    },
    {
      title: "Nepal recognized as convener",
      slug: "nepal-convening-country-2006",
      date: "2006-01-01",
      tags: ["Nepal", "Convening Country"],
      featured: true,
      body: [
        "In 2006, following discussions with representatives from Nepal and India, and building on earlier offers made by Nepal's Department of Forests, Nepal was recognized as the convener of the Regional South Asia Wildland Fire Network.",
        "This recognition was granted by the UN-ISDR Wildland Fire Advisory Group / Global Wildland Fire Network, in coordination with GFMC.",
        "Nepal's role as convening country set the stage for the network's foundation meeting, held in Kathmandu the following year.",
      ].join("\n\n"),
    },
    {
      title: "Foundation meeting in Kathmandu",
      slug: "foundation-meeting-kathmandu-2007",
      date: "2007-04-02",
      tags: ["Foundation", "Kathmandu Declaration", "GFMC", "South Asia"],
      featured: true,
      order: 1,
      body: [
        "The Foundation Meeting of the UN-ISDR Regional South Asia Wildland Fire Network was held in Kathmandu, Nepal, on 2–3 April 2007.",
        "Participants from Bangladesh, Bhutan, India, Nepal, Sri Lanka, and the Global Fire Monitoring Center (GFMC) attended the meeting. The complete list of participants is recorded in Annex II of the meeting proceedings.",
        "The meeting produced the Kathmandu Declaration, along with a formal meeting announcement and a report documenting the network's founding — see [Resources](/resources.html) for the full set of foundation meeting documents.",
      ].join("\n\n"),
    },
    {
      title: "Joins the Pan-Asia Wildland Fire Network",
      slug: "pan-asia-wildland-fire-network-2009",
      date: "2009-02-01",
      tags: ["Pan-Asia Network", "Busan"],
      featured: true,
      body: [
        "From 1–6 February 2009, the Pan-Asia Forest Fire Consultation for the UNISDR Regional Wildland Fire Networks was held in Busan, Republic of Korea.",
        "The consultation founded the Pan-Asia Wildland Fire Network, bringing together four regional networks: Northeast Asia, Central Asia, Southeast Asia (ASEAN), and South Asia.",
        "Since then, the Regional South Asia Wildland Fire Network has coordinated its activities as part of this wider Pan-Asian framework, alongside its continuing role within the UNISDR Global Wildland Fire Network.",
      ].join("\n\n"),
    },
  ];

  for (const post of posts) {
    const documentId = await createAndPublish(token, "api::post.post", {
      title: post.title,
      slug: post.slug,
      date: post.date,
      heroImage: placeholder.id,
      body: post.body,
      tags: post.tags.map((text) => ({ text })),
      featured: post.featured,
      order: post.order ?? null,
    });
    console.log("Post created:", post.slug, documentId);
  }

  // ---- Pages ----
  const pages = [
    {
      slug: "home",
      title: "Home",
      navLabel: "Home",
      navOrder: 1,
      metaDescription:
        "RSAFMRC supports the Regional South Asia Wildland Fire Network (RSAWFN), covering Bangladesh, Bhutan, India, Nepal, and Sri Lanka, under the Global Wildland Fire Network coordinated by GFMC.",
      sections: [
        {
          __component: "element.hero",
          eyebrow: "A region of the Global Wildland Fire Network",
          heading: "Enhancing regional cooperation for safer landscapes across South Asia.",
          body: "RSAFMRC supports the Regional South Asia Wildland Fire Network (RSAWFN), which exists to enhance and strengthen bilateral, multilateral, and international cooperation in wildland fire management — creating synergies and sharing knowledge, technical, and human resources between countries in the region.",
          ctaPrimaryLabel: "Learn about the network",
          ctaPrimaryHref: "/about.html",
          ctaSecondaryLabel: "Get involved",
          ctaSecondaryHref: "/contact.html",
          sideCard: {
            heading: "Member countries",
            items: [
              { text: "Bangladesh" },
              { text: "Bhutan" },
              { text: "India" },
              { text: "Nepal — convening country" },
              { text: "Sri Lanka" },
            ],
          },
        },
        {
          __component: "section.post-spotlight",
          eyebrow: "Featured stories",
          heading: "Milestones from the network's history",
        },
        {
          __component: "section.two-column",
          alt: false,
          columnLeft: [
            {
              __component: "element.text-block",
              eyebrow: "About RSAFMRC",
              heading: "A regional platform for resilient landscapes, informed response, and shared expertise.",
              body: "The Regional South Asia Wildland Fire Network was founded at a meeting in Kathmandu, Nepal, on 2–3 April 2007, bringing together Bangladesh, Bhutan, India, Nepal, and Sri Lanka with the Global Fire Monitoring Center (GFMC). It is one of the regional networks under the UNISDR Global Wildland Fire Network, coordinated by GFMC since 2002.\n\nSince 2009 the network has also formed part of the wider Pan-Asia Wildland Fire Network, alongside the Northeast Asia, Central Asia, and Southeast Asia (ASEAN) regional networks.",
            },
          ],
          columnRight: [
            {
              __component: "element.info-card",
              heading: "Mission",
              body: "To facilitate the enhancement of local, national, and regional fire management capabilities by creating synergies between scientists, managers, and policy makers — reducing the devastating effects of wildfires on property, resources, health, and the environment.",
            },
          ],
        },
        {
          __component: "section.card-grid",
          eyebrow: "Structured activities",
          heading: "What the network coordinates",
          alt: true,
          cards: [
            { heading: "Wildland Fire Early Warning", body: "Regional and national-level early warning systems to enable prompt fire detection and response." },
            { heading: "Wildland Fire Monitoring", body: "Fire monitoring linked with the GOFC/GOLD Regional Fire Implementation Team." },
            { heading: "Wildland Fire Capacity Building", body: "A Regional Training Center, run as a joint venture with GFMC, for field practice and professional development." },
            { heading: "Wildland Fire Policy and Legislation", body: "Support for national fire management policies, strategies, and improved legal frameworks." },
          ],
        },
        {
          __component: "section.two-column",
          alt: false,
          columnLeft: [
            {
              __component: "element.check-list",
              eyebrow: "Resources",
              heading: "Vision, mission, and goals",
              items: [
                { text: "Long-term goals: national policy support, sustainable regional cooperation, network strengthening" },
                { text: "Mid-term goals: dialogue between governments, NGOs, and stakeholders" },
                { text: "16 specific objectives spanning policy, early warning, research, and capacity building" },
                { text: "The Political Dimension of regional cooperation, at national, regional, and international level" },
                { text: "Meeting reports, including the Kathmandu Declaration" },
              ],
            },
          ],
          columnRight: [
            {
              __component: "element.info-card",
              heading: "Site sections",
              items: [
                { text: "About RSAFMRC" },
                { text: "Vision, mission and objectives" },
                { text: "Structured activities" },
                { text: "Resources and publications" },
                { text: "News and events" },
                { text: "Contact and collaboration" },
              ],
            },
          ],
        },
        {
          __component: "section.card-grid",
          eyebrow: "Latest updates",
          heading: "Network history and highlights",
          alt: true,
          cards: [
            { heading: "Foundation meeting held in Kathmandu", body: "2–3 April 2007 — Bangladesh, Bhutan, India, Nepal, Sri Lanka, and GFMC met in Kathmandu to found the network." },
            { heading: "Nepal recognized as convener", body: "Following discussions with Nepal and India in 2006, Nepal's Department of Forests was recognized as the network's convening country." },
            { heading: "Joined the Pan-Asia Wildland Fire Network", body: "February 2009, Busan, Republic of Korea — the network joined three others covering Northeast, Central, and Southeast Asia." },
          ],
        },
        {
          __component: "section.two-column",
          alt: false,
          columnLeft: [
            {
              __component: "element.text-block",
              eyebrow: "Collaboration",
              heading: "A stronger regional fire management network, built together.",
              body: "RSAFMRC brings together the national fire management institutions of Bangladesh, Bhutan, India, Nepal, and Sri Lanka to strengthen bilateral, multilateral, and international cooperation in wildland fire management across the region.",
            },
          ],
          columnRight: [
            {
              __component: "element.check-list",
              heading: "Ways to get involved",
              items: [
                { text: "Serve as a national focal point institution" },
                { text: "Contribute technical expertise and regional fire data" },
                { text: "Partner with GFMC on training and knowledge exchange" },
                { text: "Take part in regional dialogue and network meetings" },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "about",
      title: "About",
      navLabel: "About",
      navOrder: 2,
      metaDescription:
        "About the Regional South Asia Wildland Fire Network (RSAWFN): its vision, mission, goals, founding history, and member countries.",
      sections: [
        {
          __component: "element.hero",
          eyebrow: "About the network",
          heading: "A regional platform for fire knowledge and coordinated action.",
          body: "RSAFMRC supports the Regional South Asia Wildland Fire Network (RSAWFN), a region of the Global Wildland Fire Network connecting Bangladesh, Bhutan, India, Nepal, and Sri Lanka with the Global Fire Monitoring Center (GFMC).",
        },
        {
          __component: "section.two-column",
          anchor: "vision-mission",
          alt: false,
          columnLeft: [
            {
              __component: "element.text-block",
              heading: "Vision",
              body: "To enhance and strengthen bilateral, multilateral, and international cooperation in wildland fire management — creating synergies and sharing knowledge, technical, and human resources between countries in the region — by accepting and promoting principles, norms, rules, and decision-making procedures within a guiding framework agreed upon by individual countries.",
            },
            {
              __component: "element.text-block",
              heading: "Mission",
              body: "To facilitate the enhancement of local, national, and regional fire management capabilities by creating synergies of participating scientists, managers, and policy makers, in accordance with the mandate and scope of the UN International Strategy for Disaster Reduction (ISDR) Working Group on Wildland Fire, and in collaboration with managers, policy makers, technical experts, and scientists throughout the region and worldwide.\n\nParticular emphasis is given to reducing the devastating effects of wildfires on property, resources, health, and the environment, by strengthening institutional fire management capabilities and bringing technical expertise to communities affected by wildfires.",
            },
          ],
          columnRight: [
            {
              __component: "element.info-card",
              heading: "Cooperation mechanisms",
              items: [
                { text: "Bilateral/multilateral cooperation between countries within the region, including emergency assistance and technical support" },
                { text: "International cooperation with donors, requiring financial and technical assistance mechanisms" },
              ],
            },
          ],
        },
        {
          __component: "section.two-column",
          anchor: "goals",
          alt: true,
          columnLeft: [
            {
              __component: "element.check-list",
              heading: "Long-term goals",
              items: [
                { text: "Support the development of national policies" },
                { text: "Support sustainable cooperation between countries of the region" },
                { text: "Strengthen the Regional South Asian Wildland Fire Network" },
                { text: "Support the development of a global strategy or international agreement on cooperation in wildland fire management" },
              ],
            },
          ],
          columnRight: [
            {
              __component: "element.check-list",
              heading: "Mid-term goals",
              items: [
                { text: "Provide a forum for dialogue between governments, national focal points, NGOs, civil society, and regional and international stakeholders" },
                { text: "Serve as a catalytic and mutually supporting link between national wildland fire strategies" },
                { text: "Enable sharing of resources between neighbouring countries in the region" },
                { text: "Reinforce national and regional technical capacities in wildland fire management" },
              ],
            },
          ],
        },
        {
          __component: "section.card-grid",
          anchor: "political-dimension",
          heading: "The political dimension of regional cooperation",
          alt: false,
          cards: [
            { heading: "National level", body: "Countries adopt the regional strategy and the network's role and mandate, strengthening national fire management structures as a prerequisite for effective cooperation." },
            { heading: "Regional level", body: "Mandated regional institutions, such as SAARC, incorporate the regional strategy and the network within their structures and work programmes." },
            { heading: "International level", body: "Institutions such as UNISDR, UNEP, FAO, GFMC, GTZ, and the World Bank are encouraged to provide financial and technical assistance." },
          ],
        },
        {
          __component: "section.two-column",
          anchor: "background",
          alt: true,
          columnLeft: [
            {
              __component: "element.text-block",
              heading: "Background",
              body: "An increasing frequency and destructive force of unwanted wildfires worldwide — including the excessive use of fire in the conversion of forests to other land uses in tropical countries — affects human lives, health, economic assets, property, biodiversity, water resources, soil, atmosphere, and climate.\n\nIn response to the strategic goals of the UN Convention on Combat of Desertification, the Convention on Biological Diversity, the UN Framework Convention on Climate Change, the Ramsar Convention on Wetlands, and the UN Forum on Forests, the UN-ISDR Inter-Agency Task Force for Disaster Reduction established a Working Group on Wildland Fire (WG-4) in 2001, coordinated by GFMC. The UNISDR Global Wildland Fire Network was created in 2002 and formally recognized as a UNISDR activity in 2004, with GFMC serving as its secretariat.\n\nThe South Asia network's foundation is in line with declarations made in international forums, including the Declaration of the Tenth SAARC Summit (Colombo, 1998) on Environment.",
            },
          ],
          columnRight: [
            {
              __component: "element.info-card",
              heading: "Foundation meeting",
              body: "**2–3 April 2007, Kathmandu, Nepal**\n\nParticipants from Bangladesh, Bhutan, India, Nepal, Sri Lanka, and GFMC attended the foundation meeting, which produced the Kathmandu Declaration. Following discussions with Nepal and India in 2006, Nepal's Department of Forests was recognized as the network's convening country.\n\nSince February 2009 the network has also been one of four regional networks — alongside Northeast Asia, Central Asia, and Southeast Asia (ASEAN) — within the wider Pan-Asia Wildland Fire Network, founded in Busan, Republic of Korea.",
            },
          ],
        },
      ],
    },
    {
      slug: "programs",
      title: "Structured Activities",
      navLabel: "Programs",
      navOrder: 3,
      metaDescription:
        "The Regional South Asia Wildland Fire Network's structured activities: coordination, early warning, monitoring, management, science, capacity building, and policy.",
      sections: [
        {
          __component: "element.hero",
          eyebrow: "Structured activities",
          heading: "Themes coordinated across the regional network.",
          body: "The following themes are the candidate sub-groups and clusters of activity for the Regional South Asia Wildland Fire Network.",
        },
        {
          __component: "section.card-grid",
          alt: false,
          cards: [
            { heading: "Network Coordination", body: "Overall coordination of the regional network's activities and partner engagement." },
            { heading: "Country Focal Points", body: "A regularly updated list of network members published on the web, with members receiving circular mails." },
            { heading: "Wildland Fire Early Warning", body: "Regional and national systems for prompt fire detection and improved response time.", anchor: "early-warning" },
            { heading: "Wildland Fire Monitoring", body: "Fire monitoring linked with the GOFC/GOLD Regional Fire Implementation Team.", anchor: "monitoring" },
            { heading: "Wildland Fire Management", body: "Integrated fire management approaches with emphasis on community participation." },
            { heading: "Wildland Fire Science", body: "Transnational synergies in fire research, remote sensing, and technology transfer." },
            { heading: "Wildland Fire Capacity Building", body: "A Regional Training Center, run as a joint venture with GFMC, for field practice and professional development.", anchor: "capacity-building" },
            { heading: "Wildland Fire Policy and Legislation", body: "Development and strengthening of national fire management policies, strategies, and legal frameworks.", anchor: "policy-legislation" },
          ],
        },
      ],
    },
    {
      slug: "resources",
      title: "Resources and Publications",
      navLabel: "Resources",
      navOrder: 4,
      metaDescription:
        "Specific objectives, meeting reports, and partner organizations of the Regional South Asia Wildland Fire Network.",
      sections: [
        {
          __component: "element.hero",
          eyebrow: "Resources",
          heading: "The network's specific objectives and founding documents.",
          body: "Drawn from the Vision, Mission and Goals of the Regional South Asia Wildland Fire Network, and the reports of its 2007 foundation meeting.",
        },
        {
          __component: "section.two-column",
          anchor: "objectives",
          alt: false,
          columnLeft: [
            {
              __component: "element.check-list",
              heading: "Specific objectives",
              items: [
                { text: "Contribute to a national and regional organizational framework with agreed principles, alignments, procedures, and technical-operational formats" },
                { text: "Favour the development and strengthening of national fire management policies, strategies, and legal frameworks" },
                { text: "Establish a fire information system, standardized and agreed between countries of the region" },
                { text: "Develop fire detection early warning systems to improve response time" },
                { text: "Develop national emergency control cooperation between countries of the region" },
                { text: "Support sustainable cooperation based on concerted bilateral or multilateral programmes for prevention, training, extension, and research" },
                { text: "Create an early wildland fire warning system at regional level" },
                { text: "Support the establishment of early warning systems at national to local levels" },
              ],
            },
          ],
          columnRight: [
            {
              __component: "element.check-list",
              heading: "Specific objectives (continued)",
              items: [
                { text: "Establish and maintain the network information system on the internet" },
                { text: "Support Integrated Fire Management Systems with emphasis on community participation" },
                { text: "Facilitate transnational synergies in wildland fire research and technology development" },
                { text: "Improve access to and use of remote sensing for fire monitoring, fuel and fire management planning, and impact assessment" },
                { text: "Assist in wildfire disaster management and mitigation" },
                { text: "Facilitate capacity building at all levels of fire management" },
                { text: "Promote communication between wildland fire disciplines of Asia and other continents, under the umbrella of GFMC" },
                { text: "Establish and maintain linkage with GOFC/GOLD" },
              ],
            },
          ],
        },
        {
          __component: "section.card-grid",
          anchor: "foundation-documents",
          eyebrow: "Foundation meeting documents",
          heading: "2–3 April 2007, Kathmandu, Nepal",
          alt: true,
          cards: [
            { heading: "Meeting announcement", body: "Announcement of the Foundation Meeting of the Regional South Asia Wildland Fire Network (English, PDF)." },
            { heading: "Kathmandu Declaration", body: "The declaration issued at the close of the foundation meeting." },
            { heading: "Meeting report", body: "Report of the Foundation Meeting of the UN-ISDR Regional South Asia Wildland Fire Network, including the full list of participants in Annex II." },
            { heading: "Related networks", body: "Links to the Global Wildland Fire Network and the wider Pan-Asia Wildland Fire Network." },
          ],
        },
        {
          __component: "section.card-grid",
          anchor: "partners",
          heading: "Partner organizations",
          alt: false,
          cards: [
            { heading: "GFMC", body: "Global Fire Monitoring Center — secretariat of the Global Wildland Fire Network and the UNISDR Wildland Fire Advisory Group." },
            { heading: "UNISDR", body: "UN International Strategy for Disaster Reduction, under whose Inter-Agency Task Force the Working Group on Wildland Fire (WG-4) was established." },
            { heading: "SAARC", body: "The network's foundation aligns with the Declaration of the Tenth SAARC Summit (Colombo, 1998) on Environment." },
            { heading: "GOFC/GOLD", body: "Global Observation of Forest and Land Cover Dynamics — linked through the Regional Fire Implementation Team." },
          ],
        },
      ],
    },
    {
      slug: "news",
      title: "News and Events",
      navLabel: "News",
      navOrder: 5,
      metaDescription:
        "A timeline of milestones in the founding of the Regional South Asia Wildland Fire Network, from the 1998 SAARC Summit to the 2009 Pan-Asia Wildland Fire Network.",
      sections: [
        {
          __component: "element.hero",
          eyebrow: "News and history",
          heading: "How the regional network came together.",
          body: "A timeline of the international agreements and meetings that established the Regional South Asia Wildland Fire Network.",
        },
        {
          __component: "section.post-carousel",
          eyebrow: "Featured milestones",
          heading: "Highlights from the network's founding",
        },
        {
          __component: "section.post-timeline",
          eyebrow: "Complete record",
          heading: "Full timeline",
          alt: true,
        },
      ],
    },
    {
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      navOrder: 6,
      metaDescription:
        "Contact and collaboration information for the Regional South Asia Wildland Fire Network, convened by Nepal's Department of Forests.",
      sections: [
        {
          __component: "element.hero",
          eyebrow: "Contact",
          heading: "Let's shape the next phase of RSAFMRC together.",
          body: "The Regional South Asia Wildland Fire Network is convened by Nepal's Department of Forests, with GFMC serving as technical secretariat.",
        },
        {
          __component: "section.two-column",
          alt: false,
          columnLeft: [
            {
              __component: "element.info-card",
              heading: "Convening structure",
              items: [
                { text: "Convening country: Nepal (Department of Forests)" },
                { text: "Coordinating secretariat: Global Fire Monitoring Center (GFMC)" },
                { text: "Member countries: Bangladesh, Bhutan, India, Nepal, Sri Lanka" },
                { text: "Parent network: UNISDR Global Wildland Fire Network" },
              ],
            },
          ],
          columnRight: [
            {
              __component: "element.info-card",
              heading: "Get in touch",
              body: "National focal point institutions, partner organizations, and researchers are welcome to reach out to the network's coordinating secretariat to discuss collaboration and regional fire management activities.",
            },
          ],
        },
      ],
    },
  ];

  for (const pageData of pages) {
    const { slug, title, navLabel, navOrder, metaDescription, sections } = pageData;
    const documentId = await createAndPublish(token, "api::page.page", {
      title,
      slug,
      navLabel,
      navOrder,
      metaDescription,
      showInNav: true,
      sections,
    });
    console.log("Page created:", slug, documentId);
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error("SEED FAILED:", e.message);
  process.exit(1);
});
