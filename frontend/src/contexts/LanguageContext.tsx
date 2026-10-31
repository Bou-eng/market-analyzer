import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'tr';
type TranslationParams = Record<string, string | number>;

const en = {
  app_name: 'Market Analyzer',
  nav_overview: 'Overview',
  nav_predict: 'Predict',
  nav_segments: 'Segments',
  nav_model: 'Model',
  snapshot: 'Snapshot: Sep 2026',
  aria_primary_navigation: 'Primary navigation',
  aria_mobile_navigation: 'Mobile navigation',
  aria_switch_light: 'Switch to light mode',
  aria_switch_dark: 'Switch to dark mode',
  aria_open_menu: 'Open navigation menu',
  aria_close_menu: 'Close navigation menu',
  aria_switch_turkish: 'Switch to Turkish',
  aria_switch_english: 'Switch to English',
  overview_load_error: 'Failed to load data.',
  overview_title: 'Market Overview',
  overview_description: 'Istanbul short-term rental market summary.',
  active_listings: 'Active Listings',
  median_price: 'Median Price',
  percentile_75: '75th Percentile',
  average_capacity: 'Avg. Capacity',
  guest_count: '{{count}} guests',
  nightly_price_distribution: 'Nightly Price Distribution',
  top_neighbourhoods: 'Top Neighbourhoods by Price',
  tooltip_price: 'Price: ~{{price}} TRY',
  listings: 'Listings',
  median_price_try: 'Median price (TRY)',
  predict_loading_options: 'Loading form options...',
  predict_load_options_error: 'Failed to load form options.',
  predict_title: 'Predict Price',
  predict_description: 'Estimate nightly price based on property details.',
  room_type: 'Room Type',
  property_type: 'Property Type',
  neighbourhood: 'Neighbourhood',
  accommodates: 'Accommodates',
  bedrooms: 'Bedrooms',
  beds: 'Beds',
  minimum_nights: 'Min. Nights',
  amenity_count: 'Amenity Count',
  calculating: 'Calculating...',
  predict_button: 'Get Price Prediction',
  prediction_failed: 'Prediction failed.',
  high_confidence: 'High Confidence',
  low_confidence: 'Low Confidence',
  predicted_nightly_price: 'Predicted Nightly Price',
  model_version: 'Model version: {{version}}',
  market_segment: 'Market Segment',
  segment_assignment: 'This property falls into segment #{{id}}.',
  low_confidence_note: 'Note: Predictions for this category are known to be less accurate.',
  prediction_empty: 'Fill out the form to see a prediction.',
  segments_loading: 'Loading segments...',
  segments_title: 'Market Segments',
  segments_description: 'K-Means clustering identified 3 distinct property tiers.',
  listings_count: '{{count}} listings',
  capacity: 'Capacity:',
  bedrooms_label: 'Bedrooms:',
  amenities: 'Amenities:',
  distance_to_center: 'Dist. to Center:',
  median_price_label: 'Median Price:',
  segment_share: 'Segment Share',
  segment_profiles: 'Segment Profiles (Normalized)',
  radar_price: 'Price',
  radar_capacity: 'Capacity',
  radar_bedrooms: 'Bedrooms',
  radar_amenities: 'Amenities',
  radar_central: 'Central',
  radar_large_premium: 'Large Premium',
  radar_central_standard: 'Central Std',
  radar_remote: 'Remote',
  model_loading: 'Loading model metrics...',
  model_title: 'Model Performance',
  model_description: 'Evaluate predictive reliability for advertised nightly prices.',
  production_model: 'Production Model: {{model}}',
  production_model_description: 'Selected based on lowest MAE and acceptable residual behavior.',
  model_comparison: 'Model Comparison (Test Set)',
  residual_analysis: 'Residual Analysis',
  residual_alt: 'Residual analysis chart',
  residual_description: 'Actual vs Predicted prices. Lower residuals represent better fit.',
} as const;

type TranslationKey = keyof typeof en;

const tr: Record<TranslationKey, string> = {
  app_name: 'Piyasa Analizörü',
  nav_overview: 'Genel Bakış',
  nav_predict: 'Tahmin',
  nav_segments: 'Segmentler',
  nav_model: 'Model',
  snapshot: 'Anlık Görüntü: Eyl 2026',
  aria_primary_navigation: 'Ana navigasyon',
  aria_mobile_navigation: 'Mobil navigasyon',
  aria_switch_light: 'Açık moda geç',
  aria_switch_dark: 'Koyu moda geç',
  aria_open_menu: 'Navigasyon menüsünü aç',
  aria_close_menu: 'Navigasyon menüsünü kapat',
  aria_switch_turkish: 'Türkçeye geç',
  aria_switch_english: 'İngilizceye geç',
  overview_load_error: 'Veriler yüklenemedi.',
  overview_title: 'Piyasa Genel Bakışı',
  overview_description: 'İstanbul kısa dönem kiralama piyasası özeti.',
  active_listings: 'Aktif İlanlar',
  median_price: 'Medyan Fiyat',
  percentile_75: '75. Yüzdelik',
  average_capacity: 'Ort. Kapasite',
  guest_count: '{{count}} misafir',
  nightly_price_distribution: 'Gecelik Fiyat Dağılımı',
  top_neighbourhoods: 'Fiyata Göre En İyi Semtler',
  tooltip_price: 'Fiyat: ~{{price}} TRY',
  listings: 'İlanlar',
  median_price_try: 'Medyan fiyat (TRY)',
  predict_loading_options: 'Form seçenekleri yükleniyor...',
  predict_load_options_error: 'Form seçenekleri yüklenemedi.',
  predict_title: 'Fiyat Tahmini',
  predict_description: 'Mülk ayrıntılarına göre gecelik fiyatı tahmin edin.',
  room_type: 'Oda Türü',
  property_type: 'Mülk Türü',
  neighbourhood: 'Semt',
  accommodates: 'Kapasite',
  bedrooms: 'Yatak Odası',
  beds: 'Yatak',
  minimum_nights: 'Min. Gece',
  amenity_count: 'Olanak Sayısı',
  calculating: 'Hesaplanıyor...',
  predict_button: 'Fiyat Tahmini Al',
  prediction_failed: 'Tahmin başarısız oldu.',
  high_confidence: 'Yüksek Güven',
  low_confidence: 'Düşük Güven',
  predicted_nightly_price: 'Tahmini Gecelik Fiyat',
  model_version: 'Model sürümü: {{version}}',
  market_segment: 'Piyasa Segmenti',
  segment_assignment: 'Bu mülk #{{id}} numaralı segmentte yer alıyor.',
  low_confidence_note: 'Not: Bu kategorideki tahminlerin daha az doğru olduğu bilinmektedir.',
  prediction_empty: 'Tahmini görmek için formu doldurun.',
  segments_loading: 'Segmentler yükleniyor...',
  segments_title: 'Piyasa Segmentleri',
  segments_description: 'K-Means kümeleme 3 farklı mülk katmanı belirledi.',
  listings_count: '{{count}} ilan',
  capacity: 'Kapasite:',
  bedrooms_label: 'Yatak Odası:',
  amenities: 'Olanaklar:',
  distance_to_center: 'Merkeze Uzaklık:',
  median_price_label: 'Medyan Fiyat:',
  segment_share: 'Segment Payı',
  segment_profiles: 'Segment Profilleri (Normalize)',
  radar_price: 'Fiyat',
  radar_capacity: 'Kapasite',
  radar_bedrooms: 'Yatak Odası',
  radar_amenities: 'Olanaklar',
  radar_central: 'Merkezilik',
  radar_large_premium: 'Büyük Premium',
  radar_central_standard: 'Merkezi Standart',
  radar_remote: 'Uzak',
  model_loading: 'Model metrikleri yükleniyor...',
  model_title: 'Model Performansı',
  model_description: 'İlan edilen gecelik fiyatlar için tahmin güvenilirliğini değerlendirin.',
  production_model: 'Üretim Modeli: {{model}}',
  production_model_description: 'En düşük MAE ve kabul edilebilir artık davranışına göre seçildi.',
  model_comparison: 'Model Karşılaştırması (Test Kümesi)',
  residual_analysis: 'Artık Analizi',
  residual_alt: 'Artık analizi grafiği',
  residual_description: 'Gerçek ve tahmin edilen fiyatlar. Daha düşük artıklar daha iyi uyumu gösterir.',
};

const valueTranslations: Record<Language, Record<string, string>> = {
  en: {},
  tr: {
    'Entire home/apt': 'Tüm ev/daire',
    'Hotel room': 'Otel odası',
    'Private room': 'Özel oda',
    'Shared room': 'Paylaşımlı oda',
    Barn: 'Ahır',
    Boat: 'Tekne',
    'Camper/RV': 'Karavan',
    'Casa particular': 'Özel konut',
    Castle: 'Şato',
    'Entire bungalow': 'Tüm bungalov',
    'Entire cottage': 'Tüm kır evi',
    'Entire guest suite': 'Tüm misafir süiti',
    'Entire guesthouse': 'Tüm misafir evi',
    'Entire rental unit': 'Tüm kiralık daire',
    'Entire condo': 'Tüm apartman dairesi',
    'Entire serviced apartment': 'Tüm rezidans dairesi',
    'Entire home': 'Tüm ev',
    'Entire villa': 'Tüm villa',
    'Entire loft': 'Tüm çatı katı',
    'Entire place': 'Tüm mekân',
    'Entire townhouse': 'Tüm sıra ev',
    'Entire vacation home': 'Tüm tatil evi',
    'Farm stay': 'Çiftlik konaklaması',
    Houseboat: 'Yüzen ev',
    'Private room in boat': 'Teknede özel oda',
    'Private room in casa particular': 'Özel konutta özel oda',
    'Private room in rental unit': 'Kiralık dairede özel oda',
    'Private room in condo': 'Apartman dairesinde özel oda',
    'Private room in earthen home': 'Toprak evde özel oda',
    'Private room in guest suite': 'Misafir süitinde özel oda',
    'Private room in guesthouse': 'Misafir evinde özel oda',
    'Private room in home': 'Evde özel oda',
    'Private room in hostel': 'Hostelde özel oda',
    'Private room in loft': 'Çatı katında özel oda',
    'Private room in nature lodge': 'Doğa tesisinde özel oda',
    'Private room in pension': 'Pansiyonda özel oda',
    'Private room in serviced apartment': 'Rezidans dairesinde özel oda',
    'Private room in bed and breakfast': 'Oda-kahvaltıda özel oda',
    'Private room in boutique hotel': 'Butik otelde özel oda',
    'Private room in hotel': 'Otelde özel oda',
    'Private room in resort': 'Tatil köyünde özel oda',
    'Private room in tiny home': 'Küçük evde özel oda',
    'Private room in townhouse': 'Sıra evde özel oda',
    'Private room in treehouse': 'Ağaç evde özel oda',
    'Private room in villa': 'Villada özel oda',
    'Room in boutique hotel': 'Butik otelde oda',
    'Room in hotel': 'Otelde oda',
    'Room in aparthotel': 'Apart otelde oda',
    'Room in bed and breakfast': 'Oda-kahvaltıda oda',
    'Room in hostel': 'Hostelde oda',
    'Room in serviced apartment': 'Rezidans dairesinde oda',
    'Shared room in boutique hotel': 'Butik otelde paylaşımlı oda',
    'Shared room in guesthouse': 'Misafir evinde paylaşımlı oda',
    'Shared room in home': 'Evde paylaşımlı oda',
    'Shared room in hostel': 'Hostelde paylaşımlı oda',
    'Shared room in hotel': 'Otelde paylaşımlı oda',
    'Shared room in nature lodge': 'Doğa tesisinde paylaşımlı oda',
    'Shared room in rental unit': 'Kiralık dairede paylaşımlı oda',
    'Shared room in tiny home': 'Küçük evde paylaşımlı oda',
    'Tiny home': 'Küçük ev',
    Treehouse: 'Ağaç ev',
    'Large Premium Stays': 'Büyük Premium Konaklamalar',
    'Central Standard': 'Merkezi Standart',
    'Remote Outskirts': 'Uzak Çeperler',
    'median baseline': 'medyan taban çizgisi',
    median_baseline: 'medyan taban çizgisi',
    histgb: 'Histogram Gradyan Artırma',
    ridge: 'Ridge Regresyonu',
    linear: 'Doğrusal Regresyon',
  },
};

type LanguageContextValue = {
  language: Language;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  translateValue: (value: string) => string;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key: TranslationKey, params: TranslationParams = {}) => {
    let text = (language === 'en' ? en : tr)[key];

    Object.entries(params).forEach(([name, value]) => {
      text = text.split(`{{${name}}}`).join(String(value));
    });

    return text;
  }, [language]);

  const translateValue = useCallback((value: string) => {
    return valueTranslations[language][value] ?? value;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => current === 'en' ? 'tr' : 'en');
  }, []);

  const value = useMemo(() => ({ language, t, translateValue, toggleLanguage }), [language, t, translateValue, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
