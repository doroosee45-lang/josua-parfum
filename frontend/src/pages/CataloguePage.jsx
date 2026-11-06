import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import EditorialHero from '../components/EditorialHero';
import ProductCard from '../components/ProductCard';
import { Reveal } from '../components/Motion';
import { useBoutique } from '../context/BoutiqueContext';

const CATEGORIES = ['Tous', 'Femme', 'Homme', 'Mixte'];

const CATALOGUE_HERO_BY_CATEGORY = {
  Tous: {
    crestSubtitle: 'LA COLLECTION',
    slides: [
      {
        id: 'col-all-1',
        image: '/images/hero-1.jpg',
        eyebrow: '01 · HAUTE PARFUMERIE JOSHUA',
        headline: 'Toutes nos',
        italic: 'Créations.',
        subtext:
          'Découvrez l’intégralité de notre galerie olfactive pour Elle, pour Lui et Mixte. Des sillages choisis avec exigence, livrés à Jendouba et dans les villes voisines.',
        ctaLabel: 'Parcourir les flacons',
        ctaScrollId: 'catalogue-explorer',
      },
      {
        id: 'col-all-2',
        image: '/images/savoir-faire.jpg',
        eyebrow: '02 · ÉLÉGANCE & PROXIMITÉ',
        headline: 'L’excellence du parfum,',
        italic: 'livrée chez vous.',
        subtext:
          'Tarifs affichés en Dinars Tunisiens (DT), commande directe par panier ou WhatsApp et règlement exclusivement en espèces à la réception.',
        ctaLabel: 'Voir la sélection',
        ctaScrollId: 'catalogue-explorer',
      },
    ],
  },
  Femme: {
    crestSubtitle: 'COLLECTION FEMME',
    slides: [
      {
        id: 'col-femme-1',
        image: '/images/hero-3.jpg',
        eyebrow: '01 · UNIVERS POUR ELLE',
        headline: 'Sillages Féminins,',
        italic: 'grâce & lumière.',
        subtext:
          'Une ode aux fleurs nobles, aux pétales de rose poudrée, au jasmin solaire et aux muscs veloutés qui enveloppent la peau avec délicatesse.',
        ctaLabel: 'Découvrir Pour Elle',
        ctaScrollId: 'catalogue-explorer',
      },
      {
        id: 'col-femme-2',
        image: '/images/editorial-femme.jpg',
        eyebrow: '02 · ÉLÉGANCE FÉMININE',
        headline: 'La poésie d’un flacon',
        italic: 'inoubliable.',
        subtext:
          'Des eaux de parfum lumineuses et sensuelles sélectionnées pour accompagner chaque moment du jour comme du soir.',
        ctaLabel: 'Explorer les parfums Femme',
        ctaScrollId: 'catalogue-explorer',
      },
    ],
  },
  Homme: {
    crestSubtitle: 'COLLECTION HOMME',
    slides: [
      {
        id: 'col-homme-1',
        image: '/images/hero-2.jpg',
        eyebrow: '01 · UNIVERS POUR LUI',
        headline: 'Caractères Masculins,',
        italic: 'force & distinction.',
        subtext:
          'La profondeur des bois précieux, l’intensité de l’ambre chaud, du cuir souple et des épices fraîches dans des compositions au sillage affirmé.',
        ctaLabel: 'Découvrir Pour Lui',
        ctaScrollId: 'catalogue-explorer',
      },
      {
        id: 'col-homme-2',
        image: '/images/editorial-homme.jpg',
        eyebrow: '02 · SIGNATURE MASCULINE',
        headline: 'La noblesse des bois,',
        italic: 'l’allure moderne.',
        subtext:
          'Des fragrances charismatiques à la tenue remarquable, livrées rapidement à Jendouba et dans toutes les communes voisines.',
        ctaLabel: 'Explorer les parfums Homme',
        ctaScrollId: 'catalogue-explorer',
      },
    ],
  },
  Mixte: {
    crestSubtitle: 'COLLECTION MIXTE',
    slides: [
      {
        id: 'col-mixte-1',
        image: '/images/editorial-mixte.jpg',
        eyebrow: '01 · COLLECTION PRIVÉE',
        headline: 'Créations Mixtes,',
        italic: 'l’accord parfait.',
        subtext:
          'Des compositions libres et contemporaines où l’oud blanc, la bergamote lumineuse, l’iris et l’ambre gris dialoguent sans frontière.',
        ctaLabel: 'Découvrir les Mixtes',
        ctaScrollId: 'catalogue-explorer',
      },
      {
        id: 'col-mixte-2',
        image: '/images/hero-1.jpg',
        eyebrow: '02 · SIGNATURES UNIVERSELLES',
        headline: 'Un sillage rare,',
        italic: 'à partager ou garder.',
        subtext:
          'Pensées aussi bien pour Elle que pour Lui, nos créations mixtes révèlent une facette unique sur chaque peau.',
        ctaLabel: 'Explorer la Collection Mixte',
        ctaScrollId: 'catalogue-explorer',
      },
    ],
  },
};

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('categorie') || 'Tous';
  const normalizedKey =
    CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) || 'Tous';

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const { publicProducts } = useBoutique();

  const handleCategoryChange = (cat) => {
    if (cat === 'Tous') {
      searchParams.delete('categorie');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categorie: cat });
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...publicProducts];

    if (normalizedKey !== 'Tous') {
      list = list.filter((p) => p.category.toLowerCase() === normalizedKey.toLowerCase());
    }

    if (onlyAvailable) {
      list = list.filter((p) => p.available && Number(p.stock) > 0);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.notes || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [publicProducts, normalizedKey, onlyAvailable, searchQuery, sortBy]);

  const heroConfig = CATALOGUE_HERO_BY_CATEGORY[normalizedKey] || CATALOGUE_HERO_BY_CATEGORY.Tous;

  return (
    <div className="min-h-screen animate-page-enter">
      {/* Unified Full-Scale Editorial Hero */}
      <EditorialHero
        slides={heroConfig.slides}
        crestSubtitle={heroConfig.crestSubtitle}
        size="page"
      />

      <div id="catalogue-explorer" className="scroll-mt-[82px]" />

      {/* Opaque High-Contrast Filter Toolbar */}
      <div className="sticky top-[74px] sm:top-[82px] z-30 bg-white border-b border-[#E2D2C7] shadow-[0_12px_32px_-16px_rgba(20,14,13,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 lg:pb-0">
            {CATEGORIES.map((cat) => {
              const active = normalizedKey.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`h-[38px] px-5 rounded-full text-[10.5px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap transition-all duration-300 border ${
                    active
                      ? 'bg-[#1E1614] text-white border-[#1E1614] shadow-sm'
                      : 'bg-[#FAF6F2] text-[#2B201D] border-[#D8C6BB] hover:border-[#7A4444] hover:text-[#1A1210]'
                  }`}
                >
                  {cat === 'Tous' ? 'Toute la collection' : cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search
                className="w-3.5 h-3.5 text-[#7A4444] absolute left-3.5 top-1/2 -translate-y-1/2"
                strokeWidth={1.8}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un sillage, une note..."
                className="w-full h-[38px] rounded-full bg-[#FAF6F2] border border-[#CFAFA3] pl-9 pr-8 text-xs font-normal text-[#1A1210] placeholder:text-[#6E5D58] focus:bg-white focus:border-[#7A4444] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A3B38] hover:text-[#1A1210]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <label className="h-[38px] rounded-full inline-flex items-center gap-2 text-xs font-medium text-[#1A1210] cursor-pointer select-none bg-[#FAF6F2] border border-[#CFAFA3] px-4 hover:border-[#7A4444] transition-colors">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="accent-[#7A4444]"
              />
              <span>En stock</span>
            </label>

            <div className="h-[38px] rounded-full inline-flex items-center gap-2 bg-[#FAF6F2] border border-[#CFAFA3] px-4">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A4444]" strokeWidth={1.8} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#1A1210] focus:outline-none cursor-pointer"
              >
                <option value="recent" className="bg-white text-[#1A1210]">
                  Nouveautés
                </option>
                <option value="price-asc" className="bg-white text-[#1A1210]">
                  Prix croissant
                </option>
                <option value="price-desc" className="bg-white text-[#1A1210]">
                  Prix décroissant
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Floating Over Fixed Sakura Backdrop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-8 px-5 py-3.5 rounded-2xl bg-[#1F1715]/90 backdrop-blur-md border border-white/20 text-[11px] uppercase tracking-[0.2em] font-medium text-white shadow-md">
          <span>
            <strong className="text-[#FADCD6] font-bold">{filteredProducts.length}</strong>{' '}
            création{filteredProducts.length > 1 ? 's' : ''}
          </span>
          <span className="text-white">Tarifs en Dinars Tunisiens (DT)</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="surface-ivory-card p-14 text-center max-w-lg mx-auto">
            <p className="font-serif text-3xl font-medium text-[#1A1210]">
              Aucune création trouvée
            </p>
            <p className="text-xs font-normal text-[#3B2E2B] mt-2.5 leading-[1.8]">
              Ajustez vos critères ou réinitialisez les filtres afin d’explorer l’ensemble de notre
              collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setOnlyAvailable(false);
                handleCategoryChange('Tous');
              }}
              className="mt-6 btn-atelier-dark"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
            {filteredProducts.map((product, idx) => (
              <Reveal key={`${product.id}-${normalizedKey}`} delay={(idx % 4) * 50}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
