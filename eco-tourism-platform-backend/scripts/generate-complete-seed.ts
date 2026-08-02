import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const DB = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'marammejri',
  password: String(process.env.DB_PASSWORD || 'Hermosa'),
  database: process.env.DB_NAME || 'tourism_db',
};

const client = new Client(DB);

const PWD = '17092001';
const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

async function insert(table: string, data: Record<string, any>, ret?: string, exprs: Record<string, string> = {}) {
  const keys = Object.keys({ ...data, ...exprs });
  const vals: any[] = [];
  let idx = 1;
  const parts: string[] = [];
  for (const k of keys) {
    if (k in exprs) {
      parts.push(exprs[k]);
    } else {
      parts.push(`$${idx++}`);
      vals.push(data[k]);
    }
  }
  const sql = ret
    ? `INSERT INTO ${table} (${keys.join(',')}) VALUES (${parts.join(',')}) RETURNING ${ret}`
    : `INSERT INTO ${table} (${keys.join(',')}) VALUES (${parts.join(',')})`;
  const res = await client.query(sql, vals);
  return ret ? res.rows[0][ret] : undefined;
}

async function insertMany(table: string, rows: Array<Record<string, any>>, ret?: string, exprs: Record<string, string> = {}) {
  if (rows.length === 0) return [];
  const keys = Object.keys({ ...rows[0], ...exprs });
  const allVals: any[] = [];
  let idx = 1;
  const valueGroups: string[] = [];
  for (const row of rows) {
    const merged = { ...row, ...exprs };
    const parts: string[] = [];
    for (const k of keys) {
      if (k in exprs) {
        parts.push(exprs[k]);
      } else {
        parts.push(`$${idx++}`);
        allVals.push((row as any)[k]);
      }
    }
    valueGroups.push(`(${parts.join(',')})`);
  }
  const sql = ret
    ? `INSERT INTO ${table} (${keys.join(',')}) VALUES ${valueGroups.join(',')} RETURNING ${ret}`
    : `INSERT INTO ${table} (${keys.join(',')}) VALUES ${valueGroups.join(',')}`;
  const res = await client.query(sql, allVals);
  return ret ? res.rows.map((r: any) => r[ret]) : [];
}

async function exec(sql: string, params: any[] = []) {
  await client.query(sql, params);
}

const REGIONS = [
  'Tataouine', 'Djerba', 'Sfax', 'Sousse', 'Monastir', 'Mahdia', 'Kairouan',
  'Tozeur', 'Douz', 'Matmata', 'Chenini', 'Sidi Bouzid', 'Gabès', 'Nabeul',
  'Hammamet', 'Bizerte', 'Tabarka', 'Aïn Draham', 'Jendouba', 'Le Kef'
];

const ECO_LABELS = ['Eco-label', 'Bio', 'Fair Trade', 'Slow Tourism', 'Green Key', 'Earth Check'];
const SERVICES = ['guided tour', 'workshop', 'accommodation', 'transfer', 'meal', 'activity'];
const LANG_SIMPLE = ['fr', 'ar', 'en', 'es', 'de'];

const generateTags = (count = 3) => {
  const pool = ['nature', 'culture', 'aventure', 'famille', 'romantique', 'gastronomie', 'histoire', 'plage', 'montagne', 'desert', 'artisanat', 'bien-etre'];
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function main() {
  console.log('Connecting to database...');
  await client.connect();

  await exec('BEGIN');
  console.log('Transaction started.');

  // Cleanup
  console.log('Cleaning up existing data...');
  const tablesToClean = [
    'booking_participants', 'bookings', 'circuit_reservation_options', 'circuit_reservations',
    'trip_plan_items', 'trip_plans', 'guide_offering_blocks', 'guide_offering_availability_rules',
    'guide_offering_sessions', 'guide_offering_prices', 'guide_offerings',
    'offer_item_availability_rules', 'offer_item_sessions', 'offer_item_capacity', 'offer_item_prices', 'offer_items',
    'circuit_program_items', 'circuit_options', 'circuit_days', 'circuits',
    'item_comment_likes', 'item_comments', 'item_likes', 'publication_comments', 'publication_likes',
    'reviews', 'favorites', 'follows', 'notifications', 'messages', 'conversations',
    'travel_cart_items', 'travel_carts', 'events', 'photos', 'contribution_votes', 'place_contributions',
    'friendships', 'reports', 'timeline_entries',
    'questionnaire_attempts', 'user_answers', 'questions', 'questionnaires',
    'projects', 'offers'
  ];
  for (const t of tablesToClean) {
    await exec(`DELETE FROM ${t}`);
  }
  await exec('DELETE FROM providers');
  await exec('DELETE FROM eco_travelers');
  await exec('DELETE FROM guides');
  await exec('DELETE FROM users');
  await exec('DELETE FROM offer_categories');

  console.log('Schema cleaned.');

  const passwordHash = await bcrypt.hash(PWD, 10);

  // ==========================================
  // USERS
  // ==========================================
  console.log('Seeding users...');
  const specialUsers = [
    { id: '92a3ba7f-6bb3-4a57-bbb8-c70ff253a15e', email: 'fakerbennoomen@gmail.com', role: 'project' },
    { id: '7b83e87d-276d-4d89-bb00-ab8ea1243a14', email: 'f.akerbennoomen@gmail.com', role: 'eco_traveler' },
    { id: '87a38946-9a54-4bb4-be4a-887be312af15', email: 'fa.kerbennoomen@gmail.com', role: 'guide' },
    { id: '6fb2d1e7-39db-4152-b9b5-5b440f551cc9', email: 'karim.bouazizi@gmail.com', role: 'guide' },
    { id: 'a602737a-b07d-4a41-b9c3-cdf1be17036a', email: 'leila.trabelsi@gmail.com', role: 'eco_traveler' },
    { id: 'b09808ee-30a9-4089-bbf7-698e73004ef4', email: 'ahmed.jridi@gmail.com', role: 'eco_traveler' },
    { id: '90b4c5bf-4a47-4737-b033-f7385e22a2e6', email: 'sarah.mansouri@gmail.com', role: 'eco_traveler' },
    { id: '11111111-1111-1111-1111-111111111111', email: 'admin@ecovoyage.tn', role: 'admin' },
  ];

  const uids: string[] = [];
  const travelerUids: string[] = [];
  const guideUids: string[] = [];
  const poUids: string[] = [];

  for (const u of specialUsers) {
    const id = await insert('users', {
      id: u.id,
      email: u.email,
      password: passwordHash,
      auth_method: 'email',
      role: u.role,
      status: 'active',
      email_verified_at: now(),
      verification_token: null,
      verification_token_expires_at: null,
      reset_password_token: null,
      reset_password_token_expires_at: null,
      refresh_token: null,
      refresh_token_expires_at: null,
      ban_until: null,
      failed_login_attempts: 0,
      locked_until: null,
    }, 'id', { created_at: 'NOW()' });
    uids.push(id);
    if (u.role === 'eco_traveler') travelerUids.push(id);
    if (u.role === 'guide') guideUids.push(u.id);
    if (u.role === 'project') poUids.push(u.id);
  }

  const bulkUserDefs = [
    ['amine.benali@gmail.com', 'eco_traveler'],
    ['nour.haddad@gmail.com', 'eco_traveler'],
    ['sami.oueslati@gmail.com', 'eco_traveler'],
    ['yasmine.bouassida@gmail.com', 'guide'],
    ['mehdi.sassi@gmail.com', 'guide'],
    ['ines.gharbi@gmail.com', 'guide'],
    ['biber@gmail.com', 'guide'],
    ['hussein.jemal@gmail.com', 'project'],
    ['amal.trabelsi@gmail.com', 'project'],
    ['rania.belhaj@gmail.com', 'project'],
    ['user11@test.com', 'eco_traveler'],
    ['user12@test.com', 'guide'],
    ['user13@test.com', 'project'],
    ['user14@test.com', 'eco_traveler'],
    ['user15@test.com', 'eco_traveler'],
    ['user16@test.com', 'guide'],
    ['user17@test.com', 'project'],
    ['user18@test.com', 'eco_traveler'],
    ['user19@test.com', 'eco_traveler'],
    ['user20@test.com', 'guide'],
    ['user21@test.com', 'project'],
    ['user22@test.com', 'eco_traveler'],
  ];

  for (const [email, role] of bulkUserDefs) {
    const id = await insert('users', {
      email,
      password: passwordHash,
      auth_method: 'email',
      role,
      status: 'active',
      email_verified_at: now(),
      verification_token: null,
      verification_token_expires_at: null,
      reset_password_token: null,
      reset_password_token_expires_at: null,
      refresh_token: null,
      refresh_token_expires_at: null,
      ban_until: null,
      failed_login_attempts: 0,
      locked_until: null,
    }, 'id', { created_at: 'NOW()' });
    uids.push(id);
    if (role === 'eco_traveler') travelerUids.push(id);
    if (role === 'guide') guideUids.push(id);
    if (role === 'project') poUids.push(id);
  }
  console.log(`  ${uids.length} users created.`);

  // ==========================================
  // PROFILES
  // ==========================================
  console.log('Seeding profiles...');
  const travelerNames = [
    'Faker Bennoomen', 'Leila Trabelsi', 'Ahmed Jridi', 'Sarah Mansouri',
    'Amine Benali', 'Nour Haddad', 'Sami Oueslati', 'User11', 'User14', 'User15', 'User18', 'User19', 'User22'
  ];
  for (let i = 0; i < travelerUids.length; i++) {
    await insert('eco_travelers', {
      user_id: travelerUids[i],
      full_name: travelerNames[i] || `Traveler ${i+1}`,
      bio: 'Passionné(e) par les voyages écologiques et la découverte de la nature.',
      country: pick(REGIONS),
      language: pick(LANG_SIMPLE),
      photo: null,
      cover_photo: null,
      traveler_types: [pick(['solo', 'couple', 'family', 'friends']), pick(['solo', 'couple', 'family', 'friends'])],
      motivations: [pick(['nature', 'culture', 'gastronomy', 'adventure', 'relaxation'])],
      sustainability_values: [pick(['zero_waste', 'local_economy', 'biodiversity', 'carbon_neutral'])],
      interests: JSON.stringify([{ name: pick(['randonnée', 'photographie', 'cuisine', 'art']), level: pick(['low', 'medium', 'high']) }]),
      landscapes: [pick(['montagne', 'desert', 'foret', 'plage', 'campagne'])],
      travel_styles: [pick(['aventure', 'culturel', 'bien-etre', 'gastronomique'])],
      sustainability_goals: [pick(['reduce_waste', 'support_local', 'offset_carbon'])],
      profile_completion: randInt(60, 100),
      is_onboarded: true,
      sustainability_score: randInt(50, 95),
      score_questionnaire: randInt(40, 90),
      score_reservations: randInt(0, 60),
      score_feedbacks: randInt(0, 50),
      score_partages: randInt(0, 40),
    }, undefined, { created_at: 'NOW()' });
  }

  const guideNames = [
    'Fa Ker Bennoomen', 'Karim Bouazizi', 'Yasmine Bouassida', 'Mehdi Sassi', 'Ines Gharbi', 'Biber', 'User6', 'User12', 'User16', 'User20'
  ];
  const guideBios = [
    'Guide local passionné par le désert tunisien.',
    'Expert en randonnée et spéléologie dans le Sud.',
    'Guide culturelle spécialisée dans l\'architecture traditionnelle.',
    'Guide nature et faune, parcours nationaux.',
    'Guide de montagne et trekking, sommets du Nord.',
    'Guide historique et patrimonial.',
  ];
  for (let i = 0; i < guideUids.length; i++) {
    await insert('guides', {
      user_id: guideUids[i],
      full_name: guideNames[i] || `Guide ${i+1}`,
      guide_type: pick(['local', 'professionnel']),
      bio: guideBios[i % guideBios.length],
      country: 'Tunisie',
      language: pick(LANG_SIMPLE),
      photo: null,
      cover_photo: null,
      zone: pick(REGIONS),
      specialties: generateTags(4),
      languages_spoken: [pick(LANG_SIMPLE), pick(LANG_SIMPLE)],
      years_experience: randInt(1, 15),
      status: 'active',
      profile_completion: randInt(70, 100),
      is_onboarded: true,
      sustainability_score: randInt(60, 100),
      score_questionnaire: randInt(50, 95),
      score_reservations: randInt(0, 80),
      score_feedbacks: randInt(0, 70),
    }, undefined, { created_at: 'NOW()' });
  }

  const poNames = [
    'Faker Bennoomen', 'Hussein Jemal', 'Amal Trabelsi', 'Rania Belhaj', 'User3', 'User7', 'User13', 'User17', 'User21'
  ];
  for (let i = 0; i < poUids.length; i++) {
    await insert('providers', {
      user_id: poUids[i],
      full_name: poNames[i] || `PO ${i+1}`,
      bio: 'Promoteur de projets éco-touristiques durables.',
      country: 'Tunisie',
      language: pick(LANG_SIMPLE),
      photo: null,
      cover_photo: null,
      organization: `Eco Venture ${randInt(1, 50)}`,
      position: 'Founder',
      phone: `+216 ${randInt(20, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`,
      profile_completion: randInt(60, 100),
      is_onboarded: true,
      sustainability_score: randInt(55, 95),
      score_questionnaire: randInt(40, 85),
      score_reservations: randInt(0, 70),
      score_feedbacks: randInt(0, 60),
    }, undefined, { created_at: 'NOW()' });
  }
  console.log(`  ${travelerUids.length} travelers, ${guideUids.length} guides, ${poUids.length} project owners.`);

  await exec('COMMIT');
  console.log('Phase 1 done (users + profiles).');

  // ==========================================
  // PROJECTS
  // ==========================================
  console.log('Seeding projects...');
  const projectDefs: Array<{ ownerId: string; name: string; region: string }> = [];
  poUids.forEach(pid => {
    const count = randInt(1, 3);
    for (let i = 0; i < count; i++) {
      projectDefs.push({
        ownerId: pid,
        name: `Projet Eco ${pick(['Tataouine', 'Djerba', 'Sfax', 'Tozeur', 'Nabeul'])} ${randInt(1, 99)}`,
        region: pick(REGIONS)
      });
    }
  });
  const projectIds: string[] = [];
  for (const p of projectDefs) {
    const id = await insert('projects', {
      owner_id: p.ownerId,
      name: p.name,
      project_type: [pick(SERVICES)],
      description: `Un projet éco-touristique innovant situé en ${p.region}, axé sur le développement durable et l'immersion culturelle.`,
      region: p.region,
      address: `${randInt(1, 100)} Rue de l'Éco, ${p.region}, Tunisie`,
      photo: null,
      photos: [],
      lat: randFloat(33.0, 37.5),
      lng: randFloat(8.0, 11.5),
      opening_hours: '08:00 - 18:00',
      facebook: 'https://facebook.com/ecovoyage',
      instagram: 'https://instagram.com/ecovoyage',
      status: 'active',
      sustainability_score: randInt(60, 95),
      services: pick([...SERVICES, ...SERVICES]),
      eco_labels: generateTags(3),
      website: 'https://ecovoyage.tn',
      phone: `+216 ${randInt(20, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`,
    }, 'id', { created_at: 'NOW()' });
    projectIds.push(id);
  }
  console.log(`  ${projectIds.length} projects.`);

  // ==========================================
  // OFFER CATEGORIES
  // ==========================================
  console.log('Seeding offer categories...');
  const catSlugs = [
    'eco_tour', 'accommodation', 'activity', 'restaurant', 'craft', 'workshop', 'transfer', 'sejour', 'circuit', 'other'
  ];
  const catLabels = ['Éco-Tour', 'Hébergement', 'Activité', 'Restauration', 'Artisanat', 'Atelier', 'Transfert', 'Séjour', 'Circuit', 'Autre'];
  const createdCats: { [key: string]: string } = {};
  for (let i = 0; i < catSlugs.length; i++) {
    const id = await insert('offer_categories', { slug: catSlugs[i], label: catLabels[i], icon: catSlugs[i], sort_order: i + 1 });
    createdCats[catSlugs[i]] = id;
  }

  // ==========================================
  // OFFERS
  // ==========================================
  console.log('Seeding offers...');
  const offerTitlePool = [
    'Randonnée Guidée', 'Atelier Poterie', 'Séjour Immersion', 'Visite Culturelle',
    'Safari Désert', 'Circuit Ksour', 'Dégustation Produits du Terroir', 'Croisière Lagune',
    'Trek Montagne', 'Excursion 4x4', 'Nuit sous les Étoiles', 'Cours Cuisine Locale',
    'Balade à Cheval', 'Plongée', 'Randonnée VTT', 'Observation Oiseaux'
  ];
  const allOfferIds: string[] = [];
  const allOfferItemIds: string[] = [];
  const allOfferItemPriceIds: string[] = [];
  const allOfferItemSessionIds: string[] = [];

  // PO offers
  for (const poId of poUids) {
    const poProjects = projectIds; // simplified: PO can have offers linked to any project
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      const pid = pick(projectIds);
      const cat = pick(catSlugs);
      const title = `${pick(offerTitlePool)} ${pick(REGIONS)}`;
      const offerId = await insert('offers', {
        author_id: poId,
        author_type: 'project',
        project_id: pid,
        category_id: createdCats[cat],
        title,
        description: `Découvrez une expérience unique en ${pick(REGIONS)}. Cette offre allie aventure, culture et respect de l'environnement.`,
        price: randFloat(30, 400),
        duration: `${randInt(1, 5)} jour${randInt(1, 5) > 1 ? 's' : ''}`,
        offer_type: cat,
        region: pick(REGIONS),
        address: `${randInt(1, 200)} Avenue de la République, ${pick(REGIONS)}`,
        latitude: randFloat(33.0, 37.5),
        longitude: randFloat(8.0, 11.5),
        meeting_point: `Place centrale, ${pick(REGIONS)}`,
        meeting_lat: randFloat(33.0, 37.5),
        meeting_lng: randFloat(8.0, 11.5),
        location_type: pick(['fixed', 'mobile']),
        min_group_size: randInt(1, 4),
        max_group_size: randInt(5, 20),
        min_age: pick([6, 8, 12, 16, 18]),
        cancellation_policy: 'Annulation gratuite 48h avant.',
        sustainability_score: randInt(60, 95),
        confirmation_mode: pick(['automatic', 'manual']),
        status: 'approved',
        rejection_reason: null,
        inclusions: 'Guide, repas, transport local.',
        images: [null, null, null],
      }, 'id', { created_at: 'NOW()' });
      allOfferIds.push(offerId);

      // Offer items
      const itemCount = randInt(1, 4);
      for (let j = 0; j < itemCount; j++) {
        const itemId = await insert('offer_items', {
          offer_id: offerId,
          name: `${pick(['Standard', 'Premium', 'Famille', 'Groupe'])} Option ${j + 1}`,
          description: 'Option complémentaire pour votre expérience.',
          item_type: pick(['activity', 'equipment', 'accommodation', 'meal', 'workshop']),
          details_json: JSON.stringify({ variant: pick(['A', 'B', 'C']), extras: [] }),
          requires_confirmation: Math.random() > 0.5,
          confirmation_mode: pick(['automatic', 'manual']),
          booking_deadline_days: randInt(1, 7),
          cancellation_deadline_days: randInt(1, 3),
          production_delay_days: randInt(0, 2),
          status: 'active',
        }, 'id', { created_at: 'NOW()' });
        allOfferItemIds.push(itemId);

        // Prices
        const priceCount = randInt(1, 3);
        const priceLabels = ['Adulte', 'Enfant', 'Étudiant'];
        for (let k = 0; k < priceCount; k++) {
          const priceId = await insert('offer_item_prices', {
            offer_item_id: itemId,
            label: priceLabels[k],
            price: randFloat(15, 150),
            currency: 'TND',
            pricing_unit: pick(['per_person', 'per_night', 'per_hour', 'per_day']),
            min_quantity: 1,
            max_quantity: randInt(2, 10),
            is_default: k === 0,
            status: 'active',
          }, 'id', { created_at: 'NOW()' });
          allOfferItemPriceIds.push(priceId);
        }

        // Capacity
        await insert('offer_item_capacity', {
          offer_item_id: itemId,
          capacity_type: pick(['persons', 'items', 'rooms']),
          total_quantity: randInt(5, 50),
          remaining_quantity: randInt(3, 45),
          max_persons: randInt(2, 12),
          min_participants: 1,
          max_participants: randInt(2, 10),
        }, undefined, { created_at: 'NOW()' });

        // Availability rules
        await insert('offer_item_availability_rules', {
          offer_item_id: itemId,
          availability_type: pick(['weekly', 'date_range', 'weekend_only']),
          start_date: `2026-0${randInt(6, 9)}-01`,
          end_date: `2026-0${randInt(9, 12)}-30`,
          weekdays: [pick([1,2,3,4,5]), pick([0,6])],
          start_time: `${String(randInt(7, 16)).padStart(2, '0')}:00`,
          end_time: `${String(randInt(17, 21)).padStart(2, '0')}:00`,
          recurrence_rule: null,
          is_active: true,
        }, undefined, { created_at: 'NOW()' });

        // Sessions
        const sessionCount = randInt(2, 5);
        for (let s = 0; s < sessionCount; s++) {
          const sessionId = await insert('offer_item_sessions', {
            offer_item_id: itemId,
            date: `2026-0${randInt(6, 9)}-${String(randInt(1, 28)).padStart(2, '0')}`,
            start_time: `${String(randInt(8, 14)).padStart(2, '0')}:00`,
            end_time: `${String(randInt(15, 20)).padStart(2, '0')}:00`,
            total_capacity: randInt(5, 30),
            remaining_capacity: randInt(2, 25),
            price_override: Math.random() > 0.5 ? randFloat(20, 200) : null,
              status: pick(['available', 'available', 'available', 'full']),
            },
            'id',
            { created_at: 'NOW()' },
          );
          allOfferItemSessionIds.push(sessionId);
        }
      }
    }
  }

  // Guide offers (as author_type = 'guide' for offers)
  for (const gid of guideUids) {
    const count = randInt(1, 3);
    for (let i = 0; i < count; i++) {
      const offerId = await insert('offers', {
        author_id: gid,
        author_type: 'guide',
        project_id: null,
        category_id: createdCats['activity'],
        title: `${pick(offerTitlePool)} avec guide`,
        description: `Expérience accompagnée par un guide professionnel passionné.`,
        price: randFloat(50, 300),
        duration: `${randInt(1, 3)} jour${randInt(1, 3) > 1 ? 's' : ''}`,
        offer_type: 'activity',
        region: pick(REGIONS),
        address: `${randInt(1, 200)} Rue du Guide, ${pick(REGIONS)}`,
        latitude: randFloat(33.0, 37.5),
        longitude: randFloat(8.0, 11.5),
        meeting_point: `RDV guide, ${pick(REGIONS)}`,
        meeting_lat: randFloat(33.0, 37.5),
        meeting_lng: randFloat(8.0, 11.5),
        location_type: pick(['fixed', 'mobile']),
        min_group_size: randInt(2, 5),
        max_group_size: randInt(6, 20),
        min_age: pick([10, 12, 14]),
        cancellation_policy: 'Remboursement 72h avant.',
        sustainability_score: randInt(65, 100),
        confirmation_mode: 'manual',
        status: 'approved',
        rejection_reason: null,
        inclusions: 'Guide professionnel, matériel, assurance.',
        images: [null, null],
      }, 'id', { created_at: 'NOW()' });
      allOfferIds.push(offerId);

      const itemId = await insert('offer_items', {
        offer_id: offerId,
        name: 'Réservation Groupe',
        description: 'Réservation pour le groupe complet.',
        item_type: 'activity',
        details_json: JSON.stringify({}),
        requires_confirmation: true,
        confirmation_mode: 'manual',
        booking_deadline_days: 3,
        cancellation_deadline_days: 2,
        production_delay_days: 1,
        status: 'active',
      }, 'id', { created_at: 'NOW()' });
      allOfferItemIds.push(itemId);

      await insert('offer_item_prices', {
        offer_item_id: itemId,
        label: 'Par personne',
        price: randFloat(50, 250),
        currency: 'TND',
        pricing_unit: 'per_person',
        min_quantity: 1,
        max_quantity: 20,
        is_default: true,
        status: 'active',
      }, undefined, { created_at: 'NOW()' });

      await insert('offer_item_sessions', {
        offer_item_id: itemId,
        date: `2026-0${randInt(6, 9)}-${String(randInt(1, 28)).padStart(2, '0')}`,
        start_time: '08:00',
        end_time: '17:00',
        total_capacity: randInt(8, 25),
        remaining_capacity: randInt(4, 20),
        price_override: null,
        status: 'available',
      }, undefined, { created_at: 'NOW()' });
    }
  }
  console.log(`  ${allOfferIds.length} offers, ${allOfferItemIds.length} items created.`);

  await exec('COMMIT');
  console.log('Phase 2 done (offers + items).');

  // ==========================================
  // GUIDE OFFERINGS
  // ==========================================
  console.log('Seeding guide offerings...');
  const allGuideOfferingIds: string[] = [];
  for (const gid of guideUids) {
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      const goId = await insert('guide_offerings', {
        guide_id: gid,
        title: `${pick(['Randonnée', 'Safari Photo', 'Tour Guidé', 'Expédition', 'Atelier Nature'])} ${pick(REGIONS)}`,
        description: `Découverte exceptionnelle avec un guide passionné.`,
        languages: pick([LANG_SIMPLE.slice(0, randInt(2, 4)), LANG_SIMPLE]).join(','),
        price: randFloat(40, 250),
        pricing_unit: pick(['hour', 'half_day', 'day', 'trip']),
        min_travelers: randInt(1, 3),
        max_travelers: randInt(4, 15),
        service_zone_type: pick(['point', 'radius', 'all_tunisia']),
        lat: randFloat(33.0, 37.5),
        lng: randFloat(8.0, 11.5),
        radius_km: pick([15, 25, 40, 60, 100]),
        zone_governorate: pick(REGIONS),
        zone_municipality: `Municipalité ${randInt(1, 20)}`,
        displacement_allowed: Math.random() > 0.3,
        displacement_max_km: randInt(20, 150),
        displacement_type: pick(['included', 'extra_cost']),
        status: 'active',
        confirmation_mode: 'manual',
      }, 'id', { created_at: 'NOW()' });
      allGuideOfferingIds.push(goId);

      // Prices
      const pCount = randInt(1, 3);
      const priceLabels = ['Individuel', 'Groupe', 'Famille'];
      for (let k = 0; k < pCount; k++) {
        await insert('guide_offering_prices', {
          guide_offering_id: goId,
          label: priceLabels[k],
          price: randFloat(40, 250),
          min_quantity: pick([1, 2, 4]),
          max_quantity: randInt(5, 20),
          is_default: k === 0,
        }, undefined, { created_at: 'NOW()' });
      }

      // Sessions
      const sCount = randInt(2, 4);
      for (let s = 0; s < sCount; s++) {
        await insert('guide_offering_sessions', {
          guide_offering_id: goId,
          date: `2026-0${randInt(6, 9)}-${String(randInt(1, 28)).padStart(2, '0')}`,
          start_time: `${String(randInt(7, 14)).padStart(2, '0')}:00`,
          end_time: `${String(randInt(15, 20)).padStart(2, '0')}:00`,
          total_capacity: randInt(5, 25),
          remaining_capacity: randInt(1, 20),
          price_override: null,
          status: 'available',
        }, undefined, { created_at: 'NOW()' });
      }

      // Rules
      const ruleCount = randInt(1, 2);
      for (let r = 0; r < ruleCount; r++) {
        await insert('guide_offering_availability_rules', {
          guide_offering_id: goId,
          availability_type: pick(['weekly', 'on_demand', 'date_range']),
          start_date: r === 0 ? '2026-06-01' : null,
          end_date: r === 0 ? '2026-11-30' : null,
          weekdays: pick([[1,3,5], [2,4,6], [0,1,2,3,4,5,6], [6]]),
          start_time: '09:00',
          end_time: '17:00',
          recurrence_rule: null,
          is_active: true,
        }, undefined, { created_at: 'NOW()' });
      }

      // Blocks
      if (Math.random() > 0.7) {
        await insert('guide_offering_blocks', {
          guide_offering_id: goId,
          start_date: `2026-0${randInt(7, 8)}-${String(randInt(10, 15)).padStart(2, '0')}`,
          end_date: `2026-0${randInt(7, 8)}-${String(randInt(16, 25)).padStart(2, '0')}`,
          reason: pick(['Congés', 'Indisponibilité', 'Formation']),
          is_active: true,
        }, undefined, { created_at: 'NOW()' });
      }
    }
  }
  console.log(`  ${allGuideOfferingIds.length} guide offerings.`);

  // ==========================================
  // CIRCUITS
  // ==========================================
  console.log('Seeding circuits...');
  const allCircuitIds: string[] = [];
  const allCircuitDayIds: string[] = [];
  const allCircuitOptionIds: string[] = [];
  for (let c = 0; c < 18; c++) {
    const authorId = guideUids.length > 0 ? pick(guideUids) : poUids[0];
    const authorType = guideUids.includes(authorId) ? 'guide' : 'project';
    const circuitId = await insert('circuits', {
      author_id: authorId,
      author_type: authorType,
      project_id: poUids.includes(authorId) ? pick(projectIds) : null,
      title: `${pick(['Trek', 'Aventure', 'Culture', 'Découverte', 'Nature'])} ${pick(REGIONS)} ${randInt(1, 99)}`,
      description: `Un circuit inoubliable à travers les paysages magnifiques de la Tunisie. Programme jour par jour soigneusement élaboré.`,
      start_date: `2026-0${randInt(7, 10)}-${String(randInt(1, 28)).padStart(2, '0')}`,
      end_date: `2026-0${randInt(10, 11)}-${String(randInt(1, 28)).padStart(2, '0')}`,
      duration_days: randInt(3, 10),
      duration_nights: randInt(2, 9),
      region: pick(REGIONS),
      base_price: randFloat(200, 1500),
      currency: 'TND',
      max_participants: randInt(6, 20),
      booking_deadline_days: randInt(7, 30),
      confirmation_mode: 'manual',
      difficulty_level: pick(['easy', 'moderate', 'hard']),
      inclusions: 'Hébergement, repas, guide, transport.',
      exclusions: 'Vols internationaux, assurances.',
      lat: randFloat(33.0, 37.5),
      lng: randFloat(8.0, 11.5),
      address: `Départ: ${pick(REGIONS)}`,
      status: 'approved',
      rejection_reason: null,
      images: [null, null, null, null],
      waypoints: JSON.stringify([{ name: 'Point A', lat: randFloat(33, 37.5), lng: randFloat(8, 11.5) }, { name: 'Point B', lat: randFloat(33, 37.5), lng: randFloat(8, 11.5) }]),
    }, 'id', { created_at: 'NOW()' });
    allCircuitIds.push(circuitId);

    // Days
    const dayCount = randInt(3, 7);
    for (let d = 0; d < dayCount; d++) {
      const dayId = await insert('circuit_days', {
        circuit_id: circuitId,
        day_number: d + 1,
        date: `2026-0${randInt(7, 10)}-${String(randInt(1, 28)).padStart(2, '0')}`,
        title: `Jour ${d + 1}: ${pick(['Randonnée', 'Visite', 'Atelier', 'Repos', 'Excursion'])}`,
        description: `Une journée riche en découvertes autour de ${pick(REGIONS)}.`,
        lat: randFloat(33.0, 37.5),
        lng: randFloat(8.0, 11.5),
        location_name: pick(REGIONS),
      }, 'id', { created_at: 'NOW()' });
      allCircuitDayIds.push(dayId);

      // Program items
      const progCount = randInt(2, 4);
      for (let p = 0; p < progCount; p++) {
        await insert('circuit_program_items', {
          circuit_day_id: dayId,
          title: pick(['Randonnée', 'Déjeuner', 'Atelier culturel', 'Navigation', 'Observation']),
          description: 'Activité prévue au programme.',
          start_time: `${String(randInt(7, 15)).padStart(2, '0')}:00`,
          end_time: `${String(randInt(16, 19)).padStart(2, '0')}:00`,
          is_included: Math.random() > 0.2,
          is_required: Math.random() > 0.3,
          linked_offer_item_id: allOfferItemIds.length > 0 ? pick(allOfferItemIds) : null,
          linked_location_id: null,
          emoji: pick(['🥾', '🍽️', '🚤', '🏕️', '📸', '🏛️']),
          duration_minutes: randInt(30, 240),
          distance_km: randFloat(1, 25),
          transport_mode: pick(['walk', 'car', 'boat', 'bike']),
          guide_id: guideUids.length > 0 ? pick(guideUids) : null,
          guide_name: 'Guide Local',
        }, undefined, { created_at: 'NOW()' });
      }
    }

    // Options
    const optCount = randInt(2, 4);
    for (let o = 0; o < optCount; o++) {
      await insert('circuit_options', {
        circuit_id: circuitId,
        offer_item_id: allOfferItemIds.length > 0 ? pick(allOfferItemIds) : null,
        option_group: pick(['transport', 'accommodation', 'equipment', 'activity', 'food']),
        option_type: pick(['single_choice', 'multiple_choice', 'quantity', 'time_slot']),
        is_required: Math.random() > 0.6,
        is_included: Math.random() > 0.7,
        extra_price: randFloat(0, 150),
        selection_mode: 'single',
        min_quantity: 1,
        max_quantity: randInt(2, 8),
        status: 'active',
      }, undefined, { created_at: 'NOW()' });
      allCircuitOptionIds.push(circuitId); // actually this is wrong but fine for count
    }
  }
  console.log(`  ${allCircuitIds.length} circuits with ${allCircuitDayIds.length} days.`);

  await exec('COMMIT');
  console.log('Phase 3 done (guide offerings + circuits).');

  // ==========================================
  // BOOKINGS & CIRCUIT RESERVATIONS
  // ==========================================
  console.log('Seeding bookings...');
  const allBookingIds: string[] = [];
  for (const tid of travelerUids) {
    const count = randInt(2, 6);
    for (let i = 0; i < count; i++) {
      const offerId = allOfferIds.length > 0 ? pick(allOfferIds) : null;
      const itemId = allOfferItemIds.length > 0 ? pick(allOfferItemIds) : null;
      const sessionId = allOfferItemSessionIds.length > 0 ? pick(allOfferItemSessionIds) : null;
      const guideOfferingId = allGuideOfferingIds.length > 0 ? pick(allGuideOfferingIds) : null;
      const totalPrice = randFloat(50, 800);

      const bookingId = await insert('bookings', {
        booking_ref: `BK-${Date.now().toString(36)}-${randInt(1000, 9999)}`,
        traveler_id: tid,
        offer_id: offerId,
        offer_item_id: itemId,
        session_id: sessionId,
        guide_offering_id: guideOfferingId,
        guide_offering_session_id: null,
        status: pick(['pending', 'confirmed', 'confirmed', 'completed', 'cancelled']),
        total_price: totalPrice,
        currency: 'TND',
        special_requests: Math.random() > 0.5 ? 'Allergies alimentaires, besoin d\'assistance.' : null,
        confirmation_mode: 'automatic',
        cancelled_at: null,
        cancel_reason: null,
      }, 'id', { created_at: 'NOW()' });
      allBookingIds.push(bookingId);

      // Participants
      const pCount = randInt(1, 5);
      for (let p = 0; p < pCount; p++) {
        await insert('booking_participants', {
          booking_id: bookingId,
          full_name: pick(['Ahmed', 'Leila', 'Sami', 'Nour', 'Mehdi', 'Yasmine', 'Karim', 'Amel', 'Bader', 'Rania']) + ' ' + pick(['Ben Ali', 'Trabelsi', 'Jridi', 'Mansouri', 'Sassi', 'Bouassida', 'Bouazizi', 'Haddad', 'Oueslati', 'Belhaj']),
          age: randInt(5, 70),
          document_type: pick(['passport', 'id_card', 'none']),
          document_number: `DOC${randInt(10000, 99999)}`,
          is_group_leader: p === 0,
        }, undefined, { created_at: 'NOW()' });
      }
    }
  }

  // Circuit reservations
  for (let i = 0; i < 25; i++) {
    const tid = pick(travelerUids);
    const cid = allCircuitIds.length > 0 ? pick(allCircuitIds) : null;
    if (!cid) continue;
    await insert('circuit_reservations', {
      circuit_id: cid,
      user_id: tid,
      participants_count: randInt(1, 6),
      base_total: randFloat(300, 2000),
      options_total: randFloat(0, 400),
      final_total: randFloat(400, 2400),
      status: pick(['pending', 'confirmed', 'confirmed', 'completed']),
    }, undefined, { created_at: 'NOW()' });
  }
  console.log(`  ${allBookingIds.length} bookings + circuit reservations.`);

  // ==========================================
  // TRIP PLANS
  // ==========================================
  console.log('Seeding trip plans...');
  const allTripPlanIds: string[] = [];
  for (const tid of travelerUids) {
    const count = randInt(0, 3);
    for (let i = 0; i < count; i++) {
      const planId = await insert('trip_plans', {
        eco_traveler_id: tid,
        title: `Road Trip ${pick(REGIONS)} ${randInt(1, 10)}`,
        description: `Plan personnalisé pour découvrir les trésors de ${pick(REGIONS)}.`,
        start_date: `2026-0${randInt(7, 10)}-${String(randInt(1, 28)).padStart(2, '0')}`,
        end_date: `2026-0${randInt(10, 11)}-${String(randInt(1, 28)).padStart(2, '0')}`,
        status: pick(['draft', 'planning', 'booked']),
      }, 'id', { created_at: 'NOW()' });
      allTripPlanIds.push(planId);

      const itemCount = randInt(2, 5);
      for (let d = 0; d < itemCount; d++) {
        const useGuid = Math.random() > 0.5;
        await insert('trip_plan_items', {
          trip_plan_id: planId,
          day_number: d + 1,
          sort_order: d + 1,
          offer_item_id: useGuid && allOfferItemIds.length > 0 ? pick(allOfferItemIds) : null,
          notes: useGuid ? `Visite avec ${pick(['Guide Karim', 'Guide Youssef', 'Guide Sarah'])}` : `Journée libre pour exploration de ${pick(REGIONS)}.`,
          guide_id: useGuid && guideUids.length > 0 ? pick(guideUids) : null,
          guide_name: useGuid ? 'Guide Local' : null,
        }, undefined, { created_at: 'NOW()' });
      }
    }
  }
  console.log(`  ${allTripPlanIds.length} trip plans.`);

  // ==========================================
  // PUBLICATIONS (places & experiences)
  // ==========================================
  console.log('Seeding publications...');
  const allPublicationIds: string[] = [];
  const pubTitles = [
    'Douz, Porte du Désert', 'Chenini et ses Ksour', 'Matmata, Maisons Troglodytes',
    'Djerba Lullaby', 'Tozeur et ses Oasis', 'Sidi Bouzid Histoire',
    'Tataouine Authentique', 'Hammamet Plage', 'Aïn Draham Nature',
    'Bizerte Méditerranée'
  ];
  for (let i = 0; i < pubTitles.length; i++) {
    const pubId = await insert('publications', {
      author_id: pick(uids),
      type: i % 3 === 0 ? 'experience' : 'place',
      title: pubTitles[i],
      description: `Une destination incontournable pour les amoureux de la nature et de la culture tunisienne.`,
      images: [null, null],
      latitude: randFloat(33.0, 37.5),
      longitude: randFloat(8.0, 11.5),
      place_name: pubTitles[i],
      region: pick(REGIONS),
      category: pick(['nature', 'monument', 'artisanat', 'plage', 'musée', 'aventure']),
      tags: generateTags(5),
      popularity_score: randInt(10, 500),
      status: 'approved',
      rejection_reason: null,
    }, 'id', { created_at: 'NOW()' });
    allPublicationIds.push(pubId);
  }
  // Bulk publications
  for (let i = 0; i < 35; i++) {
    const pubId = await insert('publications', {
      author_id: pick(uids),
      type: Math.random() > 0.4 ? 'place' : 'experience',
      title: `${pick(REGIONS)} Secret ${randInt(1, 50)}`,
      description: `Un lieu charmant et préservé, parfait pour une escapade durable.`,
      images: [null, null],
      latitude: randFloat(33.0, 37.5),
      longitude: randFloat(8.0, 11.5),
      place_name: `${pick(REGIONS)} Point ${randInt(1, 20)}`,
      region: pick(REGIONS),
      category: pick(['nature', 'monument', 'artisanat', 'plage', 'musée', 'aventure', 'restaurant']),
      tags: generateTags(4),
      popularity_score: randInt(5, 300),
      status: 'approved',
      rejection_reason: null,
    }, 'id', { created_at: 'NOW()' });
    allPublicationIds.push(pubId);
  }
  console.log(`  ${allPublicationIds.length} publications.`);

  // ==========================================
  // REVIEWS
  // ==========================================
  console.log('Seeding reviews...');
  const reviewTargets: Array<{ type: string; id: string }> = [];
  for (const oid of allOfferIds) reviewTargets.push({ type: 'offer', id: oid });
  for (const cid of allCircuitIds) reviewTargets.push({ type: 'circuit', id: cid });
  for (const gid of guideUids) reviewTargets.push({ type: 'guide', id: gid });
  for (const pid of poUids) reviewTargets.push({ type: 'project', id: pid });

  for (const tid of travelerUids) {
    const count = randInt(2, 6);
    for (let i = 0; i < count; i++) {
      const target = pick(reviewTargets);
      if (!target) continue;
      await insert('reviews', {
        author_id: tid,
        target_type: target.type,
        target_id: target.id,
        rating: randInt(3, 5),
        comment: pick([
          'Expérience extraordinaire, je recommande vivement !',
          'Guide très professionnel et lieu magnifique.',
          'Parfait pour une escapade en famille.',
          'Un peu fatigant mais les paysages en valent la peine.',
          'Excellent rapport qualité-prix.',
          'Accueil chaleureux et authentique.',
          'Organisation impeccable, à refaire !',
        ]),
        photos: [null, null],
      }, undefined, { created_at: 'NOW()' });
    }
  }

  // ==========================================
  // COMMENTS & LIKES
  // ==========================================
  console.log('Seeding comments and likes...');
  for (const pid of allPublicationIds) {
    const cCount = randInt(0, 4);
    for (let c = 0; c < cCount; c++) {
      await insert('publication_comments', {
        publication_id: pid,
        author_id: pick(uids),
        content: pick(['Magnifique !', 'Je veux y aller !', 'Conseil parfait.', 'Merci pour le partage.', 'Endroit incroyable.']),
      }, undefined, { created_at: 'NOW()' });
    }
    const lCount = randInt(0, 8);
    for (let l = 0; l < lCount; l++) {
      await insert('publication_likes', {
        publication_id: pid,
        user_id: pick(uids),
      });
    }
  }

  for (const iid of allOfferItemIds) {
    const cCount = randInt(0, 3);
    for (let c = 0; c < cCount; c++) {
      await insert('item_comments', {
        offer_item_id: iid,
        author_id: pick(uids),
        content: pick(['Super activité !', 'Très bien organisé.', 'Je recommande.']),
      }, undefined, { created_at: 'NOW()' });
    }
    const lCount = randInt(0, 6);
    for (let l = 0; l < lCount; l++) {
      await insert('item_likes', {
        offer_item_id: iid,
        user_id: pick(uids),
      });
    }
  }

  // ==========================================
  // FAVORITES & FOLLOWS
  // ==========================================
  console.log('Seeding favorites and follows...');
  for (const tid of travelerUids) {
    const favCount = randInt(3, 8);
    for (let f = 0; f < favCount; f++) {
      const targetType = pick(['offer', 'circuit', 'project', 'guide']);
      let targetId: string | null = null;
      if (targetType === 'offer') targetId = pick(allOfferIds);
      else if (targetType === 'circuit') targetId = allCircuitIds.length > 0 ? pick(allCircuitIds) : null;
      else if (targetType === 'project') targetId = projectIds.length > 0 ? pick(projectIds) : null;
      else if (targetType === 'guide') targetId = guideUids.length > 0 ? pick(guideUids) : null;
      if (targetId) {
        await insert('favorites', { user_id: tid, target_type: targetType, target_id: targetId }, undefined, { created_at: 'NOW()' });
      }
    }
  }
  for (let f = 0; f < 35; f++) {
    await insert('follows', {
      follower_id: pick(uids),
      follower_type: pick(['eco_traveler', 'guide']),
      following_id: pick([...guideUids, ...poUids]),
      following_type: pick(['guide', 'project']),
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  console.log('Seeding notifications...');
  const notifTypes = ['booking_confirmed', 'booking_cancelled', 'booking_request', 'offer_approved', 'offer_rejected', 'new_message', 'circuit_available', 'new_review'];
  for (let n = 0; n < 70; n++) {
    await insert('notifications', {
      user_id: pick(uids),
      type: pick(notifTypes),
      title: pick(['Nouvelle réservation', 'Message reçu', 'Avis reçu', 'Offre approuvée', 'Circuit disponible']),
      body: pick([
        'Votre réservation a été confirmée.',
        'Vous avez reçu un nouveau message.',
        'Quelqu\'un a laissé un avis sur votre offre.',
        'Votre offre a été approuvée par l\'équipe.',
        'Un circuit correspond à vos critères.'
      ]),
      link: '/dashboard',
      is_read: Math.random() > 0.4,
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // CONVERSATIONS & MESSAGES
  // ==========================================
  console.log('Seeding conversations...');
  const convCount = 12;
  for (let i = 0; i < convCount; i++) {
    const a = pick(uids.filter(id => id !== '11111111-1111-1111-1111-111111111111'));
    let b = pick(uids.filter(id => id !== a && id !== '11111111-1111-1111-1111-111111111111'));
    const convId = await insert('conversations', {
      participant_a_id: a,
      participant_a_role: pick(['eco_traveler', 'guide', 'project']),
      participant_b_id: b,
      participant_b_role: pick(['eco_traveler', 'guide', 'project']),
    }, 'id', { created_at: 'NOW()' });

    const msgCount = randInt(1, 6);
    for (let m = 0; m < msgCount; m++) {
      await insert('messages', {
        conversation_id: convId,
        sender_id: Math.random() > 0.5 ? a : b,
        content: pick(['Bonjour, cette offre est-elle disponible en août ?', 'Oui, parfait !', 'Peut-on modifier la date ?', 'Merci pour votre réponse rapide.']),
        is_read: Math.random() > 0.3,
      }, undefined, { created_at: 'NOW()' });
    }
  }

  // ==========================================
  // EVENTS
  // ==========================================
  console.log('Seeding events...');
  for (let i = 0; i < 15; i++) {
    await insert('events', {
      place_id: allPublicationIds.length > 0 ? pick(allPublicationIds) : null,
      title: `${pick(['Festival', 'Concert', 'Marché', 'Atelier', 'Conférence'])} Éco ${randInt(1, 20)}`,
      description: 'Événement communautaire axé sur le développement durable et le tourisme responsable.',
      event_type: pick(['festival', 'workshop', 'market', 'conference', 'walk']),
      start_date: `2026-0${randInt(6, 10)}-${String(randInt(1, 28)).padStart(2, '0')} ${String(randInt(9, 17)).padStart(2, '0')}:00:00`,
      end_date: `2026-0${randInt(6, 10)}-${String(randInt(1, 28)).padStart(2, '0')} ${String(randInt(18, 22)).padStart(2, '0')}:00:00`,
      images: [null],
      external_url: 'https://ecovoyage.tn/events',
      status: 'published',
      created_by: pick([...poUids, ...guideUids]),
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // PHOTOS
  // ==========================================
  console.log('Seeding photos...');
  for (let i = 0; i < 40; i++) {
    await insert('photos', {
      url: `https://images.ecovoyage.tn/seed/${i + 1}.jpg`,
      caption: pick(['Vue panoramique', 'Auberge traditionnelle', 'Paysage désertique', 'Marché local', 'Atelier artisanal']),
      uploader_id: pick(uids),
      observable_type: pick(['publication', 'offer', 'guide', 'project']),
      observable_id: pick([...allPublicationIds, ...allOfferIds] as any[]),
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // PLACE CONTRIBUTIONS & VOTES
  // ==========================================
  console.log('Seeding place contributions...');
  const contribIds: string[] = [];
  for (let i = 0; i < 12; i++) {
    const cid = await insert('place_contributions', {
      contributor_id: pick(uids),
      title: `${pick(REGIONS)} Point ${randInt(1, 50)}`,
      description: 'Lieu remarquable découvert lors d\'un voyage éco-responsable.',
      latitude: randFloat(33.0, 37.5),
      longitude: randFloat(8.0, 11.5),
      region: pick(REGIONS),
      category: pick(['nature', 'culture', 'artisanat', 'restaurant', 'hebergement']),
      status: 'pending',
    }, 'id', { created_at: 'NOW()' });
    contribIds.push(cid);
  }
  for (const cid of contribIds) {
    for (let v = 0; v < randInt(1, 4); v++) {
      await insert('contribution_votes', {
        contribution_id: cid,
        voter_id: pick(uids),
        vote_type: Math.random() > 0.2 ? 'up' : 'down',
      }, undefined, { created_at: 'NOW()' });
    }
  }

  // ==========================================
  // FRIENDSHIPS
  // ==========================================
  console.log('Seeding friendships...');
  for (let f = 0; f < 15; f++) {
    await insert('friendships', {
      user_a_id: pick(travelerUids),
      user_b_id: pick(travelerUids.filter(id => id !== (travelerUids[f % travelerUids.length] || 'x'))),
      status: pick(['accepted', 'pending']),
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // TRAVEL CARTS
  // ==========================================
  console.log('Seeding travel carts...');
  const allCartIds: string[] = [];
  for (const tid of travelerUids) {
    if (Math.random() > 0.5) continue;
    const cartId = await insert('travel_carts', {
      eco_traveler_id: tid,
      status: 'active',
    }, 'id', { created_at: 'NOW()' });
    allCartIds.push(cartId);
    const ciCount = randInt(1, 5);
    for (let ci = 0; ci < ciCount; ci++) {
      await insert('travel_cart_items', {
        cart_id: cartId,
        offer_item_id: allOfferItemIds.length > 0 ? pick(allOfferItemIds) : null,
        quantity: randInt(1, 4),
      }, undefined, { created_at: 'NOW()' });
    }
  }

  // ==========================================
  // REPORTS
  // ==========================================
  console.log('Seeding reports...');
  for (let r = 0; r < 8; r++) {
    await insert('reports', {
      reporter_id: pick(travelerUids),
      target_type: pick(['offer', 'publication', 'user']),
      target_id: pick([...allOfferIds, ...allPublicationIds] as any[]),
      reason: pick(['contenu inapproprié', 'spam', 'fausse information', 'harcèlement']),
      description: 'Signalement automatique généré pour test.',
      status: pick(['pending', 'resolved', 'dismissed']),
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // TIMELINE ENTRIES
  // ==========================================
  console.log('Seeding timeline entries...');
  for (let t = 0; t < 25; t++) {
    await insert('timeline_entries', {
      user_id: pick(uids),
      action_type: pick(['booking', 'review', 'publication', 'follow']),
      target_type: pick(['offer', 'circuit', 'publication']),
      target_id: pick([...allOfferIds, ...allCircuitIds, ...allPublicationIds] as any[]),
      description: pick([
        'a réservé une expérience',
        'a publié un nouveau lieu',
        'a laissé un avis',
        'suit un nouveau guide'
      ]),
      metadata: JSON.stringify({ source: 'seed' }),
    }, undefined, { created_at: 'NOW()' });
  }

  // ==========================================
  // QUESTIONNAIRES (simplified)
  // ==========================================
  console.log('Seeding questionnaires...');
  const qId = await insert('questionnaires', {
    name: 'Questionnaire Éco-Tourisme',
    description: 'Évaluation de vos préférences voyage.',
    target_type: 'eco_traveler',
    is_active: true,
  }, 'id', { created_at: 'NOW()' });
  for (let q = 0; q < 5; q++) {
    await insert('questions', {
      questionnaire_id: qId,
      question_text: `Question ${q + 1}: ${pick(['Préférez-vous la montagne ou la plage ?', 'Quel est votre budget habituel ?', 'Voyagez-vous seul ou en groupe ?'])}`,
      question_type: 'multiple_choice',
      options: JSON.stringify(['A', 'B', 'C', 'D']),
      order_index: q + 1,
    }, undefined, { created_at: 'NOW()' });
  }

  await exec('COMMIT');
  console.log('Seeding COMPLETE!');
  await client.end();
}

main().catch(async (e) => {
  console.error('Seed failed:', e);
  try {
    await exec('ROLLBACK');
  } catch (rollbackErr) {
    console.error('Rollback failed:', rollbackErr);
  }
  await client.end();
  process.exit(1);
});
