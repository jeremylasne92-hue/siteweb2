import { SEO } from '../components/seo/SEO';

export function LegalNotice() {
  return (
    <div className="bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30">
      <SEO
        title="Mentions Légales"
        description="Mentions légales de la plateforme Mouvement ECHO — informations sur l'éditeur, l'hébergeur et la propriété intellectuelle."
        url="https://mouvementecho.fr/mentions-legales"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-amber-500 mb-4">
          Mentions Légales
        </h1>
        <p className="text-gray-400 mb-12">
          Dernière mise à jour : 15 mars 2026
        </p>

        {/* Éditeur */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            1. Éditeur du site
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Le site <strong className="text-white">mouvementecho.fr</strong>{' '}
            est édité par l'<strong className="text-white">Association
            Mouvement ECHO</strong>, association à but non lucratif régie par la
            loi du 1er juillet 1901 et le décret du 16 août 1901.
          </p>
          <ul className="text-gray-300 space-y-2 mt-4 ml-4">
            <li>
              <strong className="text-white">Siège social :</strong> 59 quai Boissy d'Anglas, 78380 Bougival, France
            </li>
            <li>
              <strong className="text-white">RNA :</strong> W784010993
            </li>
            <li>
              <strong className="text-white">SIRET :</strong> 933 682 510 00013
            </li>
            <li>
              <strong className="text-white">E-mail :</strong>{' '}
              <a
                href="mailto:contact@mouvementecho.fr"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                contact@mouvementecho.fr
              </a>
            </li>
            <li>
              <strong className="text-white">Téléphone :</strong>{' '}
              +33 6 00 00 00 00 [À COMPLÉTER]
            </li>
          </ul>
        </section>

        {/* Directeur de publication */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            2. Directeur de la publication
          </h2>
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">Directeur de la publication :</strong>{' '}
            Jérémy Music
          </p>
        </section>

        {/* Hébergeur */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            3. Hébergement
          </h2>
          <p className="text-gray-300 leading-relaxed mb-2">
            Le site est hébergé par :
          </p>
          <ul className="text-gray-300 space-y-2 mt-2 ml-4">
            <li>
              <strong className="text-white">OVHcloud</strong>
            </li>
            <li>
              2, rue Kellermann — 59100 Roubaix, France
            </li>
            <li>
              Téléphone : +33 9 72 10 10 07
            </li>
            <li>
              Site web :{' '}
              <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 underline">
                www.ovhcloud.com
              </a>
            </li>
          </ul>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            4. Propriété intellectuelle
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            L'ensemble des contenus présents sur le site mouvementecho.fr
            (textes, images, graphismes, logo, icônes, vidéos, sons, logiciels,
            etc.) est protégé par les dispositions du Code de la propriété
            intellectuelle et par les conventions internationales relatives à la
            propriété intellectuelle.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Toute reproduction, représentation, modification, publication,
            adaptation de tout ou partie des éléments du site, quel que soit le
            moyen ou le procédé utilisé, est interdite, sauf autorisation écrite
            préalable de l'Association Mouvement ECHO.
          </p>
        </section>

        {/* Liens hypertextes */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            5. Liens hypertextes
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Le site mouvementecho.fr peut contenir des liens hypertextes vers
            d'autres sites internet. L'Association Mouvement ECHO ne dispose
            d'aucun contrôle sur le contenu de ces sites tiers et décline toute
            responsabilité quant à leur contenu.
          </p>
        </section>

        {/* Données personnelles */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            6. Données personnelles
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Pour toute information relative à la collecte et au traitement de
            vos données personnelles, veuillez consulter notre{' '}
            <a
              href="/politique-de-confidentialite"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              Politique de Confidentialité
            </a>
            .
          </p>
        </section>

        {/* Droit applicable */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            7. Droit applicable
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Les présentes mentions légales sont soumises au droit français. En
            cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-amber-500 mb-4">
            8. Contact
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Pour toute question concernant les présentes mentions légales, vous
            pouvez nous contacter à l'adresse :{' '}
            <a
              href="mailto:contact@mouvementecho.fr"
              className="text-amber-500 hover:text-amber-400 underline"
            >
              contact@mouvementecho.fr
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
