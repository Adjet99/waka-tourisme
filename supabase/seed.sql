insert into public.categories(slug,name,icon) values
('nature','Nature','🌿'),('culture','Culture','🏛️'),('plage','Plage','🏖️'),('gastronomie','Gastronomie','🥘'),('aventure','Aventure','🥾'),('famille','Famille','👨‍👩‍👧'),('patrimoine','Patrimoine','🧱'),('insolite','Insolite','✨')
on conflict(slug) do nothing;

insert into public.cities(name,slug,region,latitude,longitude,description_short,recommended_days_min,recommended_days_max,average_budget,tags,source,verified,last_verified_at) values
('Abidjan','abidjan','District autonome d’Abidjan',5.359952,-4.008256,'Métropole ivoirienne entre lagune, culture et gastronomie.',1,4,65000,array['culture','gastronomie','urbain','famille'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Grand-Bassam','grand-bassam','Sud-Comoé',5.2118,-3.7388,'Patrimoine historique et plage près d’Abidjan.',1,2,45000,array['plage','culture','patrimoine'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Assinie','assinie','Sud-Comoé',5.133,-3.283,'Destination balnéaire entre océan et lagune.',1,3,85000,array['plage','lagune','repos'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Bingerville','bingerville','District autonome d’Abidjan',5.3558,-3.8854,'Échappée verte et historique aux portes d’Abidjan.',1,1,25000,array['nature','histoire','famille'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Jacqueville','jacqueville','Grands-Ponts',5.205,-4.414,'Destination littorale calme entre lagune et océan.',1,2,40000,array['plage','lagune','repos'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Dabou','dabou','Grands-Ponts',5.3256,-4.3768,'Ville lagunaire et excursion historique.',1,2,35000,array['histoire','lagune','culture'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Grand-Lahou','grand-lahou','Grands-Ponts',5.1367,-5.0266,'Lagunes, embouchure et nature du littoral.',1,3,50000,array['nature','lagune','plage'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Yamoussoukro','yamoussoukro','District autonome de Yamoussoukro',6.8276,-5.2893,'Capitale politique et architecture monumentale.',1,2,45000,array['architecture','culture','histoire'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Bouaké','bouake','Gbêkê',7.6906,-5.03,'Grande ville commerçante du centre.',1,2,40000,array['culture','gastronomie','marche'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Korhogo','korhogo','Poro',9.458,-5.6296,'Arts, artisanat sénoufo et reliefs du nord.',2,4,60000,array['culture','artisanat','nature'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Man','man','Tonkpi',7.4125,-7.5538,'Montagnes, cascades et randonnées dans l’ouest.',2,4,65000,array['montagne','cascade','nature','randonnee'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Daloa','daloa','Haut-Sassandra',6.8774,-6.4502,'Grande ville de l’ouest et porte du Haut-Sassandra.',1,2,40000,array['culture','local','marche'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('San-Pédro','san-pedro','San-Pédro',4.7485,-6.6363,'Ville portuaire et plages du sud-ouest.',2,4,70000,array['plage','nature','repos'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Sassandra','sassandra','Gbôklè',4.95,-6.0833,'Ville côtière historique entre fleuve et océan.',2,3,55000,array['plage','patrimoine','nature'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Bondoukou','bondoukou','Gontougo',8.0402,-2.8,'Ville historique de l’est au patrimoine religieux marqué.',2,3,50000,array['culture','histoire','architecture'],'Seed MVP — à revalider avant production',false,'2026-08-19'),
('Abengourou','abengourou','Indénié-Djuablin',6.7297,-3.4964,'Capitale de l’Indénié entre culture et région agricole.',1,2,45000,array['culture','histoire','nature'],'Seed MVP — à revalider avant production',false,'2026-08-19')
on conflict(slug) do update set updated_at=now();

insert into public.badges(slug,name,description,icon,rules) values
('explorateur-ivoirien','Explorateur ivoirien','Visiter 5 villes','🗺️','{"visitedCities":5}'),
('grand-explorateur','Grand explorateur','Visiter 10 villes','🇨🇮','{"visitedCities":10}'),
('aventurier-hasard','Aventurier du hasard','Réaliser 3 voyages issus de la roulette','🎲','{"rouletteTrips":3}')
on conflict(slug) do nothing;

-- Structured starter attractions. These are deliberately unverified until an editor validates source/hours/prices.
insert into public.attractions(city_id,category_id,name,slug,description,latitude,longitude,average_visit_duration,child_friendly,source,verified,active)
select c.id,cat.id,v.name,v.slug,v.description,v.lat,v.lng,v.duration,v.child_friendly,'Référence publique à revalider',false,true
from (values
('abidjan','nature','Parc national du Banco','parc-national-du-banco','Grand espace forestier protégé au cœur de l’agglomération abidjanaise.',5.391,-4.051,180,true),
('abidjan','culture','Musée des Civilisations de Côte d’Ivoire','musee-civilisations-ci','Collections consacrées aux cultures et patrimoines de Côte d’Ivoire.',5.336,-4.025,120,true),
('abidjan','culture','Cathédrale Saint-Paul du Plateau','cathedrale-saint-paul','Édifice religieux emblématique du Plateau.',5.329,-4.024,60,true),
('grand-bassam','patrimoine','Quartier France','quartier-france','Cœur historique de Grand-Bassam et secteur majeur du patrimoine urbain.',5.195,-3.736,150,true),
('grand-bassam','culture','Musée National du Costume','musee-national-costume','Musée consacré aux costumes et traditions vestimentaires.',5.195,-3.736,90,true),
('yamoussoukro','culture','Basilique Notre-Dame de la Paix','basilique-notre-dame-paix','Monument religieux majeur de Yamoussoukro.',6.811,-5.296,120,true),
('korhogo','nature','Mont Korhogo','mont-korhogo','Relief offrant une expérience de plein air à proximité de Korhogo.',9.46,-5.64,150,false),
('man','aventure','Dent de Man','dent-de-man','Relief emblématique de la région de Man, apprécié des amateurs de randonnée.',7.39,-7.55,240,false),
('man','nature','Cascades de Man','cascades-de-man','Site naturel populaire à proximité de Man.',7.406,-7.546,120,true),
('abengourou','culture','Palais royal de l’Indénié','palais-royal-indenie','Site culturel associé à la royauté de l’Indénié.',6.73,-3.50,90,false)
) as v(city_slug,category_slug,name,slug,description,lat,lng,duration,child_friendly)
join public.cities c on c.slug=v.city_slug
left join public.categories cat on cat.slug=v.category_slug
on conflict(city_id,slug) do nothing;

insert into public.challenges(slug,name,description,rules,active) values
('trois-lieux-mois','3 découvertes ce mois-ci','Découvrez trois lieux différents ce mois-ci.','{"visitedPlaces":3,"period":"month"}',true),
('nouvelle-ville','Nouvelle ville','Visitez une ville que vous n’avez encore jamais enregistrée dans votre passeport.','{"newCity":1}',true),
('escapade-100km','Escapade proche','Réalisez une escapade à moins de 100 km de votre point de départ.','{"maxDistanceKm":100}',true)
on conflict(slug) do nothing;
