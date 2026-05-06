/**
 * Noor Al-Huda — Internationalization (i18n)
 * Handles UI translations for English and Bengali
 */

const translations = {
    en: {
        quran: "Quran",
        hadith: "Hadith",
        hadith_single: "Hadith",
        learn: "Learn",
        qa: "Q&A",
        videos: "Videos",
        media: "Media",
        bookmarks: "Bookmarks",
        search: "Search",
        select_language: "Select Language",
        toggle_theme: "Toggle Theme",
        site_title: "Noor Al-Huda — Light of Guidance",
        site_tagline: "Your complete Islamic knowledge companion · Quran · Hadith · Dawah · Learning",
        read_quran: "Read the Quran",
        start_learning: "Start Learning",
        browse_qa: "Browse Q&A",
        ayah_of_the_day: "Ayah of the Day",
        explore: "Explore",
        featured_qa: "Featured Q&A",
        hadith_of_the_day: "Hadith of the Day",
        featured_videos: "Featured Videos",
        todays_prayer_times: "Today's Prayer Times",
        fajr: "Fajr",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
        platform: "Platform",
        resources: "Resources",
        legal: "Legal",
        privacy: "Privacy",
        terms: "Terms",
        contact: "Contact",
        all_rights_reserved: "All rights reserved.",
        may_allah_bless_your_work: "May Allah bless your work",
        read_more: "Read more",
        share: "Share",
        surah: "Surah",
        tafsir: "Tafsir",
        read_context: "Read Context",
        listen: "Listen",
        found_matching_hadiths: "Found matching hadiths",
        per_page: "Per Page",
        loading: "Loading...",
        back_to_collections: "Back to Collections",
        books_kitab: "Books (Kitab)",
        global_filters: "Global Filters",
        info: "Information",
        global_search: "Global Search",
        category: "Category",
        narrator: "Narrator",
        tags: "Tags",
        volume: "Volume",
        hadith_number: "Hadith Number",
        sahih: "Sahih",
        hasan: "Hasan",
        daif: "Da'if",
        browse_collection: "Browse Collection",
        surahs: "Surahs",
        settings: "Settings",
        translation: "Translation",
        reciter: "Reciter",
        font_size: "Font Size",
        small: "Small",
        normal: "Normal",
        large: "Large",
        narrated_by: "Narrated by",
        verified_by_scholars: "Verified by Scholars",
        read_full_answer: "Read Full Answer",
        play_episode: "Play Episode",
        no_results: "No results found matching your criteria.",
        loading_revelation: "Loading Revelation...",
        search_hadith: "Search Hadith",
        keyword_placeholder: "Keyword...",
        all_categories: "All Categories",
        all_hadiths: "All Hadiths (Full)",
        all_narrators: "All Narrators",
        all_tags: "All Tags",
        books_list: "Books List",
        surahs_settings: "Surahs & Settings",
        hadith_subtitle: "The Six Canonical Books of Hadith (Kutub al-Sittah). Explore the authentic sayings, actions, and approvals of Prophet Muhammad ﷺ.",
        surahs_count: "114 Surahs",
        collections_count: "6 Collections",
        lessons_count: "50+ Lessons",
        answers_count: "200+ Answers",
        videos_count: "150+ Videos",
        recitations_count: "Recitations",
        tutorials: "Tutorials",
        video_library_title: "Video Library",
        video_library_subtitle: "Curated Islamic lectures, Dawah training, and scholarly debates from renowned speakers worldwide.",
        media_center_title: "Media Center",
        media_center_subtitle: "Listen to Quranic recitations from world-renowned Qaris and tune into engaging Islamic podcasts.",
        featured_ayah_text: '"And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me."',
        featured_hadith_text: '"He who travels a path in search of knowledge, Allah will make easy for him a path to Paradise."',
        featured_hadith_narrator: "Narrated by Abu Hurairah (RA)",
        brand_name: "NOOR AL-HUDA"
    },
    bn: {
        quran: "কুরআন",
        hadith: "হাদিস",
        hadith_single: "হাদিস",
        learn: "শিক্ষা",
        qa: "প্রশ্নোত্তর",
        videos: "ভিডিও",
        media: "মিডিয়া",
        bookmarks: "বুকমার্কস",
        search: "অনুসন্ধান",
        select_language: "ভাষা নির্বাচন করুন",
        toggle_theme: "থিম পরিবর্তন করুন",
        site_title: "নূর আল-হুদা — হেদায়েতের আলো",
        site_tagline: "আপনার সম্পূর্ণ ইসলামিক জ্ঞানের সঙ্গী · কুরআন · হাদিস · দাওয়াহ · শিক্ষা",
        read_quran: "কুরআন পড়ুন",
        start_learning: "শেখা শুরু করুন",
        browse_qa: "প্রশ্নোত্তর দেখুন",
        ayah_of_the_day: "আজকের আয়াত",
        explore: "অন্বেষণ করুন",
        featured_qa: "নির্বাচিত প্রশ্নোত্তর",
        hadith_of_the_day: "আজকের হাদিস",
        featured_videos: "নির্বাচিত ভিডিও",
        todays_prayer_times: "আজকের নামাজের সময়",
        fajr: "ফজর",
        dhuhr: "যোহর",
        asr: "আসর",
        maghrib: "মাগরিব",
        isha: "এশা",
        platform: "প্ল্যাটফর্ম",
        resources: "উপকরণ",
        legal: "আইনি",
        privacy: "গোপনীয়তা",
        terms: "শর্তাবলী",
        contact: "যোগাযোগ",
        all_rights_reserved: "সর্বস্বত্ব সংরক্ষিত।",
        may_allah_bless_your_work: "আল্লাহ আপনার কাজে বরকত দান করুন",
        read_more: "আরও পড়ুন",
        share: "শেয়ার করুন",
        surah: "সূরা",
        tafsir: "তাফসীর",
        read_context: "প্রেক্ষাপট পড়ুন",
        listen: "শুনুন",
        found_matching_hadiths: "মিল থাকা হাদিস পাওয়া গেছে",
        per_page: "প্রতি পৃষ্ঠায়",
        loading: "লোড হচ্ছে...",
        back_to_collections: "সংগ্রহে ফিরে যান",
        books_kitab: "কিতাবসমূহ (বই)",
        global_filters: "গ্লোবাল ফিল্টার",
        info: "তথ্য",
        global_search: "গ্লোবাল সার্চ",
        category: "বিভাগ",
        narrator: "বর্ণনাকারী",
        tags: "ট্যাগ",
        volume: "খণ্ড",
        hadith_number: "হাদিস নম্বর",
        sahih: "সহীহ",
        hasan: "হাসান",
        daif: "যয়ীফ",
        browse_collection: "সংগ্রহ দেখুন",
        surahs: "সূরাসমূহ",
        settings: "সেটিংস",
        translation: "অনুবাদ",
        reciter: "কারি",
        font_size: "ফন্ট সাইজ",
        small: "ছোট",
        normal: "স্বাভাবিক",
        large: "বড়",
        narrated_by: "বর্ণনায়",
        verified_by_scholars: "আলেমদের দ্বারা যাচাইকৃত",
        read_full_answer: "সম্পূর্ণ উত্তর পড়ুন",
        play_episode: "পর্বটি চালান",
        no_results: "আপনার অনুসন্ধানের সাথে মিল থাকা কিছু পাওয়া যায়নি।",
        loading_revelation: "ওহী লোড হচ্ছে...",
        search_hadith: "হাদিস অনুসন্ধান করুন",
        keyword_placeholder: "মূলশব্দ...",
        all_categories: "সব বিভাগ",
        all_hadiths: "সব হাদিস (একত্রে)",
        all_narrators: "সব বর্ণনাকারী",
        all_tags: "সব ট্যাগ",
        books_list: "বইয়ের তালিকা",
        surahs_settings: "সূরা ও সেটিংস",
        hadith_subtitle: "হাদিসের ছয়টি প্রামাণ্য গ্রন্থ (কুতুব আল-সিত্তাহ)। রাসূলুল্লাহ ﷺ এর সহীহ বাণী, কাজ এবং অনুমোদনসমূহ অন্বেষণ করুন।",
        surahs_count: "১১৪টি সূরা",
        collections_count: "৬টি সংকলন",
        lessons_count: "৫০+ পাঠ",
        answers_count: "২০০+ উত্তর",
        videos_count: "১৫০+ ভিডিও",
        recitations_count: "তিলাওয়াত",
        tutorials: "টিউটোরিয়াল",
        video_library_title: "ভিডিও লাইব্রেরি",
        video_library_subtitle: "বিশ্বখ্যাত বক্তাদের নির্বাচিত ইসলামিক লেকচার, দাওয়াহ প্রশিক্ষণ এবং জ্ঞানগর্ভ আলোচনা।",
        media_center_title: "মিডিয়া সেন্টার",
        media_center_subtitle: "বিশ্বখ্যাত কারীদের কুরআন তিলাওয়াত শুনুন এবং চমৎকার ইসলামিক পডকাস্টগুলোতে যুক্ত হোন।",
        featured_ayah_text: '“আর যখন আমার বান্দাগণ আমার সম্পর্কে আপনার কাছে জিজ্ঞেস করে, তখন (বলুন যে) নিশ্চয় আমি অতি নিকটে। আমি আহ্বানকারীর আহ্বানে সাড়া দেই যখন সে আমাকে আহ্বান করে।”',
        featured_hadith_text: '“যে ব্যক্তি জ্ঞান অন্বেষণের পথে চলে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।”',
        featured_hadith_narrator: "আবু হুরায়রা (রা.) হতে বর্ণিত",
        brand_name: "নূর আল-হুদা"
    }
};

function translatePage(lang) {
    const elements = document.querySelectorAll('[data-t]');
    elements.forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[lang] && translations[lang][key]) {
            // Check if it's an input with placeholder
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    // Update document title if applicable
    const pageTitleKey = document.body.getAttribute('data-page-title');
    if (pageTitleKey && translations[lang][pageTitleKey]) {
        document.title = `${translations[lang][pageTitleKey]} — ${translations[lang]['site_title']}`;
    }

    // Update lang button text
    const langBtn = document.querySelector('.lang-btn');
    if (langBtn) {
        langBtn.textContent = lang.toUpperCase();
    }

    // Set html lang attribute
    document.documentElement.lang = lang;
}

// Export for use in main.js
window.i18n = {
    translatePage,
    translations
};
