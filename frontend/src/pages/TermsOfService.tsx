import { SEO } from '../components/seo/SEO';

export function TermsOfService() {
  return (
    <div className="bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30">
      <SEO
        title="Conditions Générales d'Utilisation"
        description="Conditions générales d'utilisation de la plateforme Mouvement ECHO — règles d'utilisation du service."
        url="https://mouvement-echo.fr/cgu"
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-amber-500 mb-4">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-gray-400 mb-12">
          Dernière mise à jour : 11 mars 2026
        </p>

        {/* Objet et acceptation */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            1. Objet et acceptation
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Les présentes Conditions Générales d'Utilisation (ci-après « CGU »)
            ont pour objet de définir les modalités et conditions d'utilisation
            de la plateforme <strong className="text-white">Mouvement ECHO</strong>{' '}
            (ci-après « la Plateforme »), éditée par l'Association Mouvement
            ECHO, association loi 1901.
          </p>
          <p className="text-gray-300 leading-relaxed">
            L'utilisation de la Plateforme implique l'acceptation pleine et
            entière des présentes CGU. Si vous n'acceptez pas ces conditions,
            veuillez ne pas utiliser la Plateforme.
          </p>
        </section>

        {/* Conditions d'inscription */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            2. Conditions d'inscription
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            L'inscription sur la Plateforme est ouverte à toute personne
            physique âgée de <strong className="text-white">15 ans minimum</strong>.
            Les mineurs de moins de 15 ans ne sont pas autorisés à créer un
            compte.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            Lors de l'inscription, l'utilisateur s'engage à :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>Fournir des informations exactes et à jour</li>
            <li>Maintenir la confidentialité de ses identifiants de connexion</li>
            <li>
              Ne pas créer de comptes multiples ou usurper l'identité d'un tiers
            </li>
            <li>
              Signaler immédiatement toute utilisation non autorisée de son
              compte
            </li>
          </ul>
        </section>

        {/* Règles d'utilisation */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            3. Règles d'utilisation
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            L'utilisateur s'engage à utiliser la Plateforme de manière conforme
            à sa destination et dans le respect des lois et règlements en
            vigueur. Il est notamment interdit de :
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
            <li>
              Publier ou transmettre des contenus illicites, diffamatoires,
              injurieux, obscènes ou portant atteinte aux droits d'autrui
            </li>
            <li>
              Utiliser la Plateforme à des fins commerciales non autorisées
            </li>
            <li>
              Tenter d'accéder de manière non autorisée aux systèmes
              informatiques de la Plateforme
            </li>
            <li>
              Perturber le fonctionnement normal de la Plateforme (spam, attaques
              DDoS, etc.)
            </li>
            <li>
              Collecter ou extraire des données personnelles d'autres
              utilisateurs
            </li>
          </ul>
        </section>

        {/* Responsabilités */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            4. Responsabilités
          </h2>
          <h3 className="text-xl text-white mb-3">
            4.1 Responsabilité de l'éditeur
          </h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            L'Association Mouvement ECHO s'efforce d'assurer la disponibilité et
            le bon fonctionnement de la Plateforme. Toutefois, elle ne saurait
            être tenue responsable des interruptions temporaires, des erreurs
            techniques ou des pertes de données résultant de circonstances
            indépendantes de sa volonté.
          </p>
          <h3 className="text-xl text-white mb-3">
            4.2 Responsabilité de l'utilisateur
          </h3>
          <p className="text-gray-300 leading-relaxed">
            L'utilisateur est seul responsable de l'utilisation qu'il fait de la
            Plateforme et des contenus qu'il y publie. Il garantit l'Association
            contre toute réclamation de tiers liée à son utilisation de la
            Plateforme.
          </p>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            5. Propriété intellectuelle
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            L'ensemble des éléments constituant la Plateforme (textes, images,
            vidéos, graphismes, logo, logiciels, bases de données, etc.) est la
            propriété exclusive de l'Association Mouvement ECHO ou de ses
            partenaires et est protégé par les lois relatives à la propriété
            intellectuelle.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Toute reproduction, représentation ou exploitation non autorisée de
            ces éléments, en tout ou partie, constitue une contrefaçon
            sanctionnée par le Code de la propriété intellectuelle.
          </p>
        </section>

        {/* Suspension et résiliation */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            6. Suspension et résiliation
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            L'Association Mouvement ECHO se réserve le droit de suspendre ou de
            supprimer le compte de tout utilisateur qui ne respecterait pas les
            présentes CGU, sans préavis ni indemnité.
          </p>
          <p className="text-gray-300 leading-relaxed">
            L'utilisateur peut à tout moment demander la suppression de son
            compte en contactant{' '}
            <a
              href="mailto:mouvement.echo.france@gmail.com"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              mouvement.echo.france@gmail.com
            </a>
            .
          </p>
        </section>

        {/* Modification des CGU */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            7. Modification des CGU
          </h2>
          <p className="text-gray-300 leading-relaxed">
            L'Association Mouvement ECHO se réserve le droit de modifier les
            présentes CGU à tout moment. Les utilisateurs inscrits seront
            informés de toute modification substantielle par e-mail. La
            poursuite de l'utilisation de la Plateforme après notification vaut
            acceptation des nouvelles CGU.
          </p>
        </section>

        {/* Droit applicable */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            8. Droit applicable et juridiction compétente
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Les présentes CGU sont régies par le droit français.
          </p>
          <p className="text-gray-300 leading-relaxed">
            En cas de litige relatif à l'interprétation ou à l'exécution des
            présentes, les parties s'efforceront de trouver une solution amiable.
            À défaut, le litige sera soumis aux tribunaux compétents en France.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            9. Contact
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Pour toute question relative aux présentes CGU, vous pouvez nous
            contacter à l'adresse :{' '}
            <a
              href="mailto:mouvement.echo.france@gmail.com"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              mouvement.echo.france@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
