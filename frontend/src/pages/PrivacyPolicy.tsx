import { SEO } from '../components/seo/SEO';

export function PrivacyPolicy() {
  return (
    <div className="bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30">
      <SEO
        title="Politique de Confidentialité"
        description="Politique de confidentialité de la plateforme Mouvement ECHO — protection de vos données personnelles conformément au RGPD."
        url="https://mouvement-echo.fr/politique-de-confidentialite"
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-amber-500 mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-gray-400 mb-12">
          Dernière mise à jour : 11 mars 2026
        </p>

        {/* Responsable du traitement */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            1. Responsable du traitement
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Le responsable du traitement des données personnelles est
            l'<strong className="text-white">Association Mouvement ECHO</strong>,
            association régie par la loi du 1er juillet 1901, dont le siège social
            est situé au 59 quai Boissy d'Anglas, 78380 Bougival, France
            (RNA : W784010993, SIRET : 933 682 510 00013).
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            Contact :{' '}
            <a
              href="mailto:mouvement.echo.france@gmail.com"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              mouvement.echo.france@gmail.com
            </a>
          </p>
        </section>

        {/* Données collectées */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            2. Données collectées
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Nous collectons les données suivantes dans le cadre du fonctionnement
            de la plateforme :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">Données d'inscription :</strong>{' '}
              adresse e-mail, nom d'utilisateur
            </li>
            <li>
              <strong className="text-white">Données partenaires :</strong>{' '}
              nom, adresse postale, informations de contact professionnel
            </li>
            <li>
              <strong className="text-white">Données techniques :</strong>{' '}
              adresse IP (à des fins de sécurité et de limitation de requêtes)
            </li>
            <li>
              <strong className="text-white">Données de candidature :</strong>{' '}
              informations soumises via les formulaires de candidature technique
            </li>
          </ul>
        </section>

        {/* Finalités */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            3. Finalités du traitement
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vos données sont traitées pour les finalités suivantes :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Gestion des comptes utilisateurs et authentification</li>
            <li>Traitement des candidatures techniques</li>
            <li>Gestion des partenariats</li>
            <li>
              Statistiques anonymes de fréquentation (Google Analytics 4 en mode
              cookieless)
            </li>
            <li>
              Sécurité de la plateforme (détection de tentatives d'accès
              frauduleux)
            </li>
          </ul>
        </section>

        {/* Base légale */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            4. Base légale du traitement
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">Consentement :</strong> lors de
              l'inscription et de la soumission de formulaires
            </li>
            <li>
              <strong className="text-white">Intérêt légitime :</strong>{' '}
              sécurité de la plateforme, prévention des abus, statistiques
              anonymes
            </li>
            <li>
              <strong className="text-white">Exécution d'un contrat :</strong>{' '}
              gestion des comptes partenaires
            </li>
          </ul>
        </section>

        {/* Durée de conservation */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            5. Durée de conservation
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">Comptes utilisateurs :</strong>{' '}
              conservés tant que le compte est actif, puis 3 ans après la
              dernière activité
            </li>
            <li>
              <strong className="text-white">Logs de sécurité :</strong> 1 an
            </li>
            <li>
              <strong className="text-white">Candidatures :</strong> 2 ans après
              la dernière interaction
            </li>
          </ul>
        </section>

        {/* Droits */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            6. Vos droits
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">Droit d'accès :</strong> obtenir
              une copie de vos données personnelles
            </li>
            <li>
              <strong className="text-white">Droit de rectification :</strong>{' '}
              corriger des données inexactes ou incomplètes
            </li>
            <li>
              <strong className="text-white">Droit de suppression :</strong>{' '}
              demander l'effacement de vos données
            </li>
            <li>
              <strong className="text-white">Droit à la portabilité :</strong>{' '}
              recevoir vos données dans un format structuré
            </li>
            <li>
              <strong className="text-white">Droit d'opposition :</strong> vous
              opposer au traitement de vos données
            </li>
            <li>
              <strong className="text-white">
                Droit de limitation du traitement :
              </strong>{' '}
              demander la suspension du traitement
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Pour exercer vos droits, contactez-nous à{' '}
            <a
              href="mailto:mouvement.echo.france@gmail.com"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              mouvement.echo.france@gmail.com
            </a>
            . Nous répondrons dans un délai de 30 jours.
          </p>
          <p className="text-gray-300 leading-relaxed mt-2">
            Vous pouvez également introduire une réclamation auprès de la CNIL
            (Commission Nationale de l'Informatique et des Libertés) :{' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              www.cnil.fr
            </a>
          </p>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            7. Cookies
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            La plateforme utilise les cookies suivants :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">
                Cookie de session (nécessaire) :
              </strong>{' '}
              cookie httpOnly utilisé pour l'authentification. Ce cookie est
              strictement nécessaire au fonctionnement du service et ne requiert
              pas de consentement.
            </li>
            <li>
              <strong className="text-white">
                Google Analytics 4 (optionnel) :
              </strong>{' '}
              utilisé en mode cookieless (sans dépôt de cookies) pour des
              statistiques anonymes de fréquentation. Aucun cookie tiers n'est
              déposé.
            </li>
          </ul>
        </section>

        {/* Hébergeur */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            8. Hébergement
          </h2>
          <p className="text-gray-300 leading-relaxed">
            La plateforme est hébergée par{' '}
            <strong className="text-white">OVHcloud</strong> (2, rue Kellermann — 59100 Roubaix, France). Les données sont
            stockées sur des serveurs sécurisés situés en France.
          </p>
        </section>

        {/* Destinataires */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            9. Destinataires des données
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Vos données personnelles peuvent être transmises aux destinataires suivants :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">OVHcloud</strong> (hébergement) — serveurs situés en France/UE
            </li>
            <li>
              <strong className="text-white">Google Analytics 4</strong> (statistiques anonymes) — mode cookieless, données agrégées uniquement
            </li>
            <li>
              <strong className="text-white">Google reCAPTCHA v3</strong> (protection anti-spam) — traitement lors de la connexion uniquement
            </li>
            <li>
              <strong className="text-white">SendGrid (Twilio)</strong> (envoi d'emails transactionnels) — emails de vérification et notifications
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Aucune donnée n'est vendue ou partagée à des fins commerciales avec des tiers.
          </p>
        </section>

        {/* Transferts hors UE */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            10. Transferts de données hors Union européenne
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Certains de nos prestataires peuvent traiter des données en dehors de l'Union européenne :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              <strong className="text-white">Google (Analytics, reCAPTCHA)</strong> — transferts encadrés par le EU-US Data Privacy Framework
            </li>
            <li>
              <strong className="text-white">SendGrid/Twilio</strong> — transferts encadrés par les clauses contractuelles types (CCT) de la Commission européenne
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            L'hébergement principal (OVHcloud) est situé en France.
          </p>
        </section>

        {/* DPO */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            11. Délégué à la protection des données
          </h2>
          <p className="text-gray-300 leading-relaxed">
            L'Association Mouvement ECHO, comptant moins de 250 membres et ne traitant pas de données sensibles à grande échelle, n'a pas désigné de délégué à la protection des données (DPO) au sens de l'article 37 du RGPD. Pour toute question relative à la protection de vos données, contactez-nous à{' '}
            <a
              href="mailto:mouvement.echo.france@gmail.com"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              mouvement.echo.france@gmail.com
            </a>.
          </p>
        </section>

        {/* Modification */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            12. Modification de la politique
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Nous nous réservons le droit de modifier cette politique de
            confidentialité à tout moment. En cas de modification substantielle,
            les utilisateurs inscrits seront informés par e-mail. La date de
            dernière mise à jour est indiquée en haut de cette page.
          </p>
        </section>
      </div>
    </div>
  );
}
