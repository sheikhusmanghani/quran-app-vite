import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function SurahDetail() {
  const { number } = useParams();
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTranslation, setSelectedTranslation] = useState("urdu"); // Default Urdu Translation

  const fetchSurah = async () => {
    try {
      const { data } = await axios.get(
        `https://api.alquran.cloud/v1/surah/${number}/editions/ar.uthmani,ur.kanzuliman,en.ahmedraza,ar.jalalayn`
        // editions/ur.kanzuliman --> kanzuliman , ur.qadri --> tahirulqadri , ar.jalalayn --> jalalain
      );

      const combinedData = {
        arabicEdition: data.data[0], // Quran text
        urduEdition: data.data[1], // Urdu
        englishEdition: data.data[2], // English
        jalalainArabic: data.data[3], // jalalainArabic
      };

      setSurah(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurah();
  }, [number]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );

  // 🔍 Filtered Ayahs based on search term
  const filteredAyahs = surah.arabicEdition.ayahs.filter(
    (ayah) =>
      ayah.number.toString().startsWith(searchTerm.toString()) ||
      ayah.text.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔙 Back Button & Search Button */}
      <div className="container mx-auto px-2 py-2 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center font-semibold text-blue-600 hover:text-red-800 transition text-lg"
        >
          <ArrowLeftCircleIcon className="h-6 w-auto mr-2 border-2 rounded-full" />
          Back to Surahs
        </Link>

        {/* 🔍 Search & Translation Dropdown */}
        <div className="flex gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center mainColor text-white px-2 py-2 rounded-xl shadow-md hover:mainColor transition-all duration-300"
          >
            <MagnifyingGlassIcon className="h-5 w-5 " />
          </button>

          {/* 🌍 Translation Select Dropdown */}
          <select
            // value={selectedTranslation} // iski ab need nhi hy
            onChange={(e) => setSelectedTranslation(e.target.value)}
            className="mainColor appearance-none text-center text-white px-2 py-2 rounded-xl shadow-md hover:bg-blue-400 transition-all duration-500 cursor-pointer "
          >
            <option value="urdu">Urdu ▷ </option>
            <option value="arabic">Arabic ▷</option>
            <option value="english">English ▷</option>
          </select>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div
        className={`container mx-auto px-6 transition-all duration-300 overflow-hidden ${
          searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <input
          type="text"
          placeholder="Search Ayah..."
          className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:mainColor focus:outline-none shadow-md mt-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📖 Surah Header */}
      <div className="container mx-auto px-2 py-4 text-wrap mainColor text-white rounded-lg shadow-md text-center">
        <h1 className="text-xl md:text-3xl font-[Arial] font-bold  ">
          {surah.arabicEdition.englishName}{" "}
          <span className="text-lg mt-1">
            ({surah.arabicEdition.englishNameTranslation})
          </span>
        </h1>
        <p className="text-sm mt-1 font-semibold text-wrap">
          Surah Number : {surah.arabicEdition.number} -{" "}
          {surah.arabicEdition.revelationType === "Meccan" ? "Makki" : "Madani"}{" "}
          - Total Aayaat : {surah.arabicEdition.numberOfAyahs}
        </p>
      </div>

      {/* 📜 Surah Ayahs */}
      <div className="container mx-auto py-3 shadow-3xl">
        <div className="bg-white rounded-lg shadow-md p-4 space-y-6">
          {filteredAyahs.length > 0 ? (
            filteredAyahs.map((ayah, index) => (
              <div
                key={ayah.number}
                className="p-2 border-b-2 border-gray-200 last:border-0"
              >
                {/* Arabic Text */}
                <div className="text-2xl text-justify font-arabic leading-loose text-gray-900">
                  {ayah.text}
                  <span className="mainColor text-white inline-flex justify-center items-center h-7 px-2 rounded-full mr-2 shadow-md">
                    {ayah.numberInSurah}
                  </span>
                </div>

                {/* 🌍 Dynamic Translation Based on Selected Language */}

                {selectedTranslation === "arabic" ? (
                  <p className="text-justify font-arabic text-xl right-dir">
                    {surah.jalalainArabic.ayahs[index].text}
                  </p>
                ) : selectedTranslation === "english" ? (
                  <p className="text-justify left-dir font-sans text-md">
                    {surah.englishEdition.ayahs[index].text}
                  </p>
                ) : (
                  <p className="text-justify font-urdu text-xl right-dir">
                    {surah.urduEdition.ayahs[index].text}
                  </p>
                )}
              </div>
              //
            )) // end of map()
          ) : (
            // if no data
            <div className="flex items-center justify-center h-36">
              <span className="text-gray-500 text-lg font-semibold">
                No matching Ayah found! Try another search.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
