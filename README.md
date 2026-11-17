# Maison Ambrée

Socle technique d’une boutique de parfums. Le catalogue Angular contient trois parfums fictifs. PostgreSQL démarre avec un schéma vide, créé par Flyway.

## Démarrage avec Docker

Prérequis. Docker Engine avec le plugin Compose v2 et les ports locaux 4200 et 8080 disponibles.

```sh
cp .env.example .env
```

Renseigner `POSTGRES_PASSWORD` dans `.env`, puis exécuter depuis la racine du dépôt.

```sh
docker compose config --quiet
docker compose up --build -d
docker compose logs -f backend
```

- Boutique à l’adresse http://localhost:4200
- Santé HTTP à l’adresse http://localhost:8080/api/health et via le proxy de la boutique à l’adresse http://localhost:4200/api/health
- Swagger de développement à l’adresse http://localhost:8080/swagger-ui/index.html
- Schéma OpenAPI à l’adresse http://localhost:8080/v3/api-docs

`docker compose down` arrête les services et conserve le volume nommé `postgres_data`. Les ports web écoutent uniquement sur la boucle locale. PostgreSQL est accessible aux services du réseau Compose.

## Développement avec les outils locaux

Prérequis. JDK 21, Maven 3.9.12, Node.js 24.22.1, npm 11.9.0 et un PostgreSQL 17 accessible. Créer une base vide et donner à l’utilisateur configuré les droits de migration sur cette base.

Dans un premier terminal, définir `DB_URL`, `DB_USER` et `DB_PASSWORD` d’après l’instance locale, puis lancer le backend.

```sh
export SPRING_PROFILES_ACTIVE=dev
mvn -f backend/pom.xml spring-boot:run
```

En développement, les valeurs par défaut ciblent `jdbc:postgresql://localhost:5432/parfum` avec l’utilisateur `parfum`. Définir `DB_PASSWORD` pour les profils `dev` et `prod`. Le profil `prod` exige également `DB_URL` et `DB_USER` et désactive Swagger et OpenAPI. L’API de santé vérifie que le processus HTTP répond. L’initialisation du contexte Spring exige une connexion à PostgreSQL réussie.

Dans un deuxième terminal, lancer Angular.

```sh
cd frontend
npm ci
npm start
```

## Vérifications

Depuis la racine du dépôt.

```sh
mvn -B -f backend/pom.xml verify
docker compose config --quiet
docker compose build
```

Depuis `frontend/`.

```sh
npm ci
npm run typecheck
npm run build
npm test -- --watch=false
```

## Architecture

- `backend/src/main/java/com/maisonambre/shop/` contient le monolithe Spring Boot. Les packages `product`, `category`, `brand`, `inventory`, `customer` et `order` délimitent les futurs modules métier. `security` contient la configuration HTTP et `common` expose la santé et les réponses d’erreur au format Problem Details.
- `backend/src/main/resources/` contient les profils `dev` et `prod` et les migrations. Hibernate utilise `ddl-auto: validate`. Flyway est responsable de l’évolution du schéma. Les modèles JPA métier seront ajoutés avec leurs cas d’usage.
- `frontend/src/app/` contient le layout global de la boutique et les composants standalone répartis entre `storefront`, `catalog` et `admin`. Les routes panier, checkout et administration présentent des écrans de démarrage. L’administration est une maquette sans accès à des données ni à des opérations sensibles.
- `frontend/public/` contient le visuel d’accueil généré pour le projet. Les produits de démonstration sont définis dans le code Angular, indépendamment de la base.
- `Jenkinsfile` définit une pipeline déclarative pour un agent Linux équipé du JDK 21, de Maven, de Node.js, de npm et de Docker Compose. Configurer une pipeline multibranche à partir de la source Git avec les composants Jenkins Pipeline et JUnit. Les étapes construisent les applications, lancent les tests et construisent les images. Le projet local peut être rattaché à un dépôt GitHub existant via un remote.

## Versions et compatibilité

| Composant | Version ou référence |
|---|---|
| Java | 21 LTS, compilation locale vérifiée en 21.0.13 |
| Maven | 3.9.12 |
| Spring Boot | 3.5.16, ligne 3.x compatible Java 21 |
| Spring Data JPA | 3.5.13, BOM Spring Data 2025.0.13 |
| Hibernate ORM | 6.6.53.Final |
| Spring Security | 6.5.11 |
| Flyway | 11.7.2, avec module PostgreSQL |
| PostgreSQL | 17.9, pilote JDBC 42.7.11 |
| springdoc-openapi | 2.8.17, ligne compatible Spring Boot 3.5 |
| JUnit Jupiter et Mockito | 5.12.2 et 5.17.0, gérés par Spring Boot |
| Node.js et npm | 24.22.1 et 11.9.0 |
| Angular et CLI | 21.2.26 et 21.2.30 |
| TypeScript et Tailwind CSS | 5.9.3 et 4.3.5 |
| Vitest et jsdom | 4.1.12 et 28.1.0 |
| NGINX | 1.28.2 Alpine |
| Docker Engine et Compose | 29.9.2 et 2.40.3 dans l’environnement de vérification |
| Jenkins | 2.580.2 LTS, cible de configuration |
| Git | 2.52.0 dans l’environnement de vérification |

Le parent Maven gère les versions de l’écosystème Spring. Le verrou npm fixe les dépendances transitives. L’image JRE Temurin de la branche 21 Alpine reçoit les mises à jour de Java 21 à la reconstruction.

## Migration V1

`brands` et `categories` référencent chacune plusieurs `products`. Chaque produit possède des `product_variants` avec un SKU unique et une contenance unique pour le produit. `inventory.variant_id` est la clé primaire et la référence vers une variante. Les quantités en stock et réservées sont positives ou nulles, avec une réservation plafonnée au stock.

Un `customer` est identifié par un courriel unique sans distinction de casse. Un client peut avoir plusieurs `orders`, chacune liée à des `order_items`. Une ligne conserve le nom du produit, son SKU et son prix au moment de la commande. La devise à trois lettres définie sur la commande s’applique à ses lignes. Le type `numeric(12,2)` est utilisé pour les prix unitaires et `numeric(14,2)` pour le total. Les futures écritures métier devront assurer la cohérence du total, de la devise et des transitions d’état.
