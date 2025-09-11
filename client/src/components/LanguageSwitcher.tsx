import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-700">{i18n.t('language')}:</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${i18n.language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('pa')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${i18n.language === 'pa' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        ਪੰਜਾਬੀ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
