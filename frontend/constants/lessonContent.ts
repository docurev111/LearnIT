export type Activity = {
  type: 'video' | 'reading' | 'quiz' | 'flashcards';
  title: string;
  videoId?: string;
  content?: string;
};

export type Flashcard = {
  front_question: string;
  front_term: string;
  back: string;
};

export type DayContent = {
  title: string;
  activities: Activity[];
  flashcards?: Flashcard[];
};

export type TermCard = {
  section: string;
  term: string;
  definition: string;
  halimbawa: string;
};

export type LessonContent = {
  title: string;
  description: string;
  days: DayContent[];
  termCards?: TermCard[];
};

export const LESSON_CONTENT: Record<string, LessonContent> = {
  "1": {
    title: "Gamit ng Isip at Kilos-loob sa Sariling Pagpapasiya at Pagkilos",
    description: "Araling tungkol sa katangian, gamit, at tunguhin ng isip at kilos-loob.",
    termCards: [
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Ano ang pagkakaiba ng isip ng tao sa isip ng hayop?",
        definition: "Ang ating isip ay **higit na matalino.**",
        halimbawa: ""
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Masasabing matalino ang isip ng tao dahil sa pamamagitan nito ay nagagawa nating:",
        definition: "1.) Umunawa at matuto\n2.) Magbigay ng kahulugan\n3.) Magnilay\n4.) Umalala\n5.) Humusga\n6.) Magsuri\n7.) Tumuklas o mag-imbento\n8.) Mangat-wiran o magbigay ng dahilan",
        halimbawa: ""
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Umunawa at matuto",
        definition: "Ang taglay na katalinuhan ng isip ng tao ang dahilan kung bakit kaya nating matutuhan ang maraming bagay tulad ng pagbabasa, pagsusulat, pagmamaneho ng bisikleta, at iba pa.",
        halimbawa: ""
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Magbigay ng kahulugan",
        definition: "Bahagi ng pagiging matalino natin ay nagagawa nating magbigay ng interpretasyon o kahulugan sa mga bagay na ating nasasaksihan, nararanasan, o nararamdaman.",
        halimbawa: "Halimbawa, Nakita mong tahimik ang kaklase mong masiyahin, naiisip mo na \"baka may problema siya\"."
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Magnilay",
        definition: "Dahil sa talino ng tao, nagagawa rin nating magnilay o salaminin ang ating sarili.",
        halimbawa: "Halimbawa, Natatanong natin sa ating sarili kung, ano kaya ang dapat kong baguhin sa aking sarili upang mas maging mabuting kaibigan ako? Ano-ano ang mga mabubuti o masasama kong ugali?"
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Umalala",
        definition: "Ang tao ay may kakayahan ding alalahanin ang mga bagay na kanyang napagdaanan. May mga pagkakataon na kahit matagal na natin itong naranasan ay naaalala pa rin natin.",
        halimbawa: ""
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Humusga",
        definition: "Isa pa sa mga nagagawa natin bunga ng ating matalinong pag-iisip ay ang humusga o timbangin ang mga bagay. Madalas natin itong ginagawa sa tuwing tayo ay nagdedesisyon. Nahuhusgahan natin ang kilos kung ito ba ay mabuti o masama, o tama o mali.",
        halimbawa: ""
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Magsuri",
        definition: "Isa pa sa mga nagagawa natin dahil sa ating matalinong pag-iisip ay ang pagsusuri o pag aanalyse.",
        halimbawa: "Halimbawa nito ay ang ginagawa nating pag-iisip sa tuwing tayo ay sumasagot sa mga bugtong o riddle."
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Tumuklas o mag-imbento",
        definition: "Dahil sa ating matalinong pag-iisip, malawak din ang ating imahinasyon. At kaakibat nito, nagagawa ng tao na mag-imbento ng iba't ibang bagay na makapagpapadali ng kaniyang pamumuhay. Nagagawa rin niya ang tumuklas ng mga bagay na maaaring maging lunas o solusyon sa mga sakit o problemang kinakaharap ng lipunan.",
        halimbawa: "Halimbawa ay ang mga vaccines."
      },
      {
        section: "Ang Matalinong Isip ng Tao",
        term: "Mangat-wiran o magbigay ng dahilan",
        definition: "Kaya nating ipaliwanag o pangatwiranan ang mga bagay na ating nagagawa.",
        halimbawa: "Halimbawa, sa pagbibigay ng opinion o posisyon sa isang isyung kinakaharap ng Lipunan tulad ng kahirapan, pandemia, kaguluhan, at iba pa."
      }
    ],
    days: [
      {
        title: "Day 1",
        activities: [
          { 
            type: "video", 
            title: "Watch Video Lesson",
            videoId: "bGvEAd5JhS0"
          },
          { 
            type: "reading", 
            title: "Read Lesson",
            content: JSON.stringify({
              panimula: `Ano ang pagkakaiba ng isip ng tao sa isip ng hayop? Ang ating isip ay higit na matalino.\n\nMasasabing matalino ang isip ng tao dahil sa pamamagitan nito ay nagagawa nating: umunawa at matuto, magbigay ng kahulugan, magnilay, umalala, humusga, magsuri, tumuklas o mag-imbento, at mangatwiran o magbigay ng dahilan.`,
              
              nilalaman: `Ang Isip ng Tao:\n\nAng taglag na katalinuhan ng isip ng tao ang dahilan kung bakit kaya nating matutuhan ang maraming bagay tulad ng pagbabasa, pagsusulat, at pagmamaneho ng bisikleta.\n\nDahil sa talino ng tao, nagagawa rin nating magnilay o salaminin ang ating sarili. Natatanong natin sa ating sarili kung ano kaya ang dapat kong baguhin upang mas maging mabuting kaibigan?\n\nBahagi ng pagiging matalino natin ay nagagawa nating magbigay ng interpretasyon o kahulugan sa mga bagay na ating nasasaksihan. Halimbawa, nakita mong tahimik ang kaklase mong masiyahin, naiisip mo na "baka may problema siya".\n\nAng tao ay may kakayahan ding alalahanin ang mga bagay na kanyang napagdaanan. May mga pagkakataon na kahit matagal na natin itong naranasan ay naaalala pa rin natin.\n\nDahil sa ating matalinong pag-iisip, malawak din ang ating imahinasyon. Nagagawa ng tao na mag-imbento ng iba't ibang bagay na makapagpapadali ng kaniyang pamumuhay, tulad ng mga vaccines.\n\nAng Kilos-Loob:\n\nIto ay malaya kaya tinatawag din itong free will. Tinatawag itong malaya sapagkat ang tao ay may kalayaan na gawin ang mga bagay na kanyang ninanais. Nagagawa nating magdesisyon para sa ating sarili.\n\nHindi tulad ng hayop na kumikilos batay sa emosyon, tayong mga tao ay may kakayahan na pumili. Halimbawa, kahit tayo ay gutom, kung alam nating hindi sa atin ang pagkain, hindi natin iyon kakainin.\n\nAng kilos-loob ay may gawaing isakatuparan ang sinasabi ng isip. Kung kaya sa pagpapasya, kailangang pag-isipan muna nating mabuti. Hindi dapat nakadepende sa emosyon ang ating magiging desisyon.`,
              
              halimbawa: `Mga Halimbawa ng Paggamit ng Isip:\n\n• Umunawa at Matuto - Pag-aaral ng pagbabasa, pagsusulat, o pagmamaneho\n• Magnilay - Pagtatanong sa sarili kung paano maging mabuting tao\n• Magbigay ng Kahulugan - Pag-interpret sa tahimik na kaklase na may problema\n• Umalala - Pag-alala sa mga nakaraang karanasan\n• Magsuri - Pag-iisip habang sumasagot sa bugtong o riddle\n• Tumuklas o Mag-imbento - Pag-imbento ng mga bakuna o teknolohiya\n• Humusga - Pagtimbang kung tama o mali ang isang kilos\n• Mangatwiran - Pagbibigay ng opinion sa mga isyung panlipunan\n\nMga Halimbawa ng Paggamit ng Kilos-Loob:\n\n• Pagpigil sa sarili kahit gutom kung hindi sa atin ang pagkain\n• Paghingi ng pahintulot sa guro bago umalis ng klase\n• Pagpili ng mabuti kaysa sa masama\n• Paggawa ng kabutihan sa kapwa`,
              
              buod: `Ang Tunguhin ng Isip:\nDahil matalino at maraming kakayahan ang ating isip, ang dapat na maging tunguhin nito ay ang pagtuklas ng katotohanan, kaalaman, at karunungan sa pamamagitan ng patuloy na pag-aaral at pagsasaliksik.\n\nAng Tunguhin ng Kilos-Loob:\nAng dapat na maging tunguhin ng ating malayang kilos-loob ay ang pagmamahal o pag-ibig. Ang dapat nating mahalin ay ang ating kapwa, bayan, kalikasan, at ang Diyos.\n\nMataas na Gamit:\nGinagamit natin ang ating isip sa pag-aaral at pagsasaliksik. Ginagamit natin ang ating kilos-loob sa paggawa ng kabutihan at pagpili ng tama.\n\nDito natin mapamamalas na tayo ay nagpapakatao - kapag ginagamit natin ang ating isip at kilos-loob para sa kabutihan.`,
              
              reflection: "Kailan mo huling ginamit ang isip sa paggawa ng desisyon? Paano mo ito ginamit kasama ang iyong kilos-loob?",
              
              keyTerms: {
                "Isip": "Ang kakayahan ng tao na mag-isip, mag-unawa, at magpasya na ginagamit sa pagtuklas ng katotohanan at karunungan.",
                "Kilos-Loob": "Ang malayang kakayahan ng tao na pumili at kumilos ayon sa isip. Tinatawag din itong free will.",
                "Pagpapasiya": "Ang proseso ng pagpili ng pinakamabuting aksyon o desisyon gamit ang isip at kilos-loob.",
                "Katotohanan": "Ang tunay na kalagayan o katangian ng isang bagay na hinahanap ng isip.",
                "Karunungan": "Ang malalim na pag-unawa at karanasan sa buhay na resulta ng patuloy na pag-aaral.",
                "Pagmamahal": "Ang tunguhin ng kilos-loob na ipinakikita sa paggawa ng kabutihan sa kapwa, bayan, kalikasan, at Diyos."
              }
            })
          },
          { 
            type: "quiz", 
            title: "Short exercise"
          },
          { 
            type: "flashcards", 
            title: "Practice Flashcards"
          }
        ],
        flashcards: [
          { front_question: "Ano ang pagkakaiba ng isip ng tao sa isip ng hayop?", front_term: "Isip ng Tao — Pagkakaiba sa Hayop", back: "Ang ating isip ay higit na matalino." },
        {
          front_question: "Masasabing matalino ang isip ng tao dahil sa pamamagitan nito ay nagagawa nating? (8 ang sagot dito.)",
          front_term: "Isip ng Tao — Mga Kakayahan (8)",
          back: `1. Umunawa at matuto
2. Magbigay ng kahulugan
3. Magnilay
4. Umalala
5. Humusga
6. Magsuri
7. Tumuklas o mag-imbento
8. Mangatwiran o magbigay ng dahilan`
        },  
        { front_question: "Ano ang ibig sabihin ng 'Umunawa at Matuto'?", front_term: "Isip — Umunawa at Matuto", back: "Kakayahan ng isip na matuto at umunawa ng mga bagay." }, 
        { front_question: "Halimbawa ng 'Umunawa at Matuto'", front_term: "Isip — Halimbawa ng Umunawa at Matuto", back: "Pag-aaral ng pagbabasa, pagsusulat, o pagmamaneho." },
        // --- Magnilay ---
        { front_question: "Ano ang ibig sabihin ng 'Magnilay'?", front_term: "Isip — Magnilay", back: "Pagninilay o pagsasalamin sa sarili." },
        { front_question: "Halimbawa ng 'Magnilay'", front_term: "Isip — Halimbawa ng Magnilay", back: "Pagtatanong sa sarili kung paano maging mabuting tao." },
        // --- Magbigay ng Kahulugan ---
        { front_question: "Ano ang ibig sabihin ng 'Magbigay ng Kahulugan'?", front_term: "Isip — Magbigay ng Kahulugan", back: "Kakayahang bigyan ng kahulugan ang mga karanasan o sitwasyon." },
        { front_question: "Halimbawa ng 'Magbigay ng Kahulugan'", front_term: "Isip — Halimbawa ng Magbigay ng Kahulugan", back: "Tahimik ang kaklase → iniisip mong baka may problema siya." },
        // --- Umalala ---
        { front_question: "Ano ang ibig sabihin ng 'Umalala'?", front_term: "Isip — Umalala", back: "Kakayahang alalahanin ang mga nakaraan." },
        // --- Magsuri ---
        { front_question: "Ano ang ibig sabihin ng 'Magsuri'?", front_term: "Isip — Magsuri", back: "Kakayahang mag-analisa o mag-isip nang malalim." },
        { front_question: "Halimbawa ng 'Magsuri'", front_term: "Isip — Halimbawa ng Magsuri", back: "Pag-iisip habang sumasagot sa bugtong o riddle." },
        // --- Tumuklas o Mag-imbento ---
        { front_question: "Ano ang ibig sabihin ng 'Tumuklas o Mag-imbento'?", front_term: "Isip — Tumuklas o Mag-imbento", back: "Paglikha o pagtuklas gamit ang talino at imahinasyon." },
        { front_question: "Halimbawa ng 'Tumuklas o Mag-imbento'", front_term: "Isip — Halimbawa ng Tumuklas o Mag-imbento", back: "Pag-imbento ng mga bakuna o teknolohiya." },
        // --- Humusga ---
        { front_question: "Ano ang ibig sabihin ng 'Humusga'?", front_term: "Isip — Humusga", back: "Pagtimbang kung tama o mali, mabuti o masama ang isang kilos." },
        // --- Mangatwiran ---
        { front_question: "Ano ang ibig sabihin ng 'Mangatwiran'?", front_term: "Isip — Mangatwiran", back: "Kakayahang ipaliwanag o bigyang-katuwiran ang kilos o opinyon." },
        { front_question: "Halimbawa ng 'Mangatwiran'", front_term: "Isip — Halimbawa ng Mangatwiran", back: "Pagbibigay ng opinion sa isyu ng kahirapan o kaguluhan." },
        // --- Tunghin ng Isip ---
        { front_question: "Ano ang tunguhin ng isip?", front_term: "Isip — Tunghin", back: "Pagtuklas ng katotohanan, kaalaman, at karunungan." },
        { front_question: "Paano isinasagawa ang mataas na gamit ng isip?", front_term: "Isip — Mataas na Gamit", back: "Sa pamamagitan ng pag-aaral at pagsasaliksik." },
        // --- Kilos-Loob ---
        { front_question: "Ano ang ibig sabihin ng 'Kilos-Loob'?", front_term: "Kilos-Loob — Kahulugan", back: "Malayang kakayahan ng tao na pumili at kumilos ayon sa isip." },
        { front_question: "Bakit tinatawag na 'malaya' ang kilos-loob?", front_term: "Kilos-Loob — Dahilan ng Kalayaan", back: "Dahil kaya nating pumili kung ano ang gusto o ayaw natin." },
        { front_question: "Ano ang pagkakaiba ng tao at hayop sa kilos?", front_term: "Kilos-Loob — Pagkakaiba sa Hayop", back: "Ang tao ay kumikilos ayon sa isip, ang hayop ayon sa emosyon." },
        // --- Isinasakatuparan ng Kilos-Loob ---
        { front_question: "Ano ang tungkulin ng kilos-loob sa isip?", front_term: "Kilos-Loob — Tungkulin sa Isip", back: "Isakatuparan ang sinasabi ng isip." },
        { front_question: "Bakit kailangang pag-isipan muna bago kumilos?", front_term: "Kilos-Loob — Dahilan ng Pag-iisip Muna", back: "Upang hindi padalos-dalos sa emosyon; dapat batay sa katwiran." },
        // --- Tunghin ng Kilos-Loob ---
        { front_question: "Ano ang tunguhin ng kilos-loob?", front_term: "Kilos-Loob — Tunghin", back: "Pagmamahal o pag-ibig." },
        { front_question: "Paano ipinapakita ang mataas na gamit ng kilos-loob?", front_term: "Kilos-Loob — Mataas na Gamit", back: "Sa paggawa ng kabutihan at pagpili ng tama." },
        ]
      },
      {
        title: "Day 2",
        activities: [
          { 
            type: "video", 
            title: "Watch Video Lesson",
            videoId: "xz8GcfIbtOM"
          },
          { 
            type: "reading", 
            title: "Read Lesson",
            content: "This is dummy content for Day 2 reading.\n\n\nParagraph 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\nParagraph 2: Nullam ac urna eu felis dapibus condimentum sit amet a augue. Sed non neque elit. Sed ut imperdiet nisi. Proin condimentum fermentum nunc."
          },
          { 
            type: "quiz", 
            title: "Short exercise"
          },
          { 
            type: "flashcards", 
            title: "Practice Flashcards"
          }
        ]
      },
        {
        title: "Day 3",
        activities: [
          { 
            type: "video", 
            title: "Watch Video Lesson",
            videoId: "u3kXB8OVXVs"
          },
          { 
            type: "reading", 
            title: "Read Lesson",
            content: "This is dummy content for Day 3 reading.\n\n\nParagraph 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\nParagraph 2: Nullam ac urna eu felis dapibus condimentum sit amet a augue. Sed non neque elit. Sed ut imperdiet nisi. Proin condimentum fermentum nunc."
          },
          { 
            type: "quiz", 
            title: "Short exercise"
          }
        ]
      }
    ]
  },
  "2": {
    title: "Dignidad ng Tao Bilang Batayan ng Paggalang sa Sarili, Pamilya, at kapuwa",
    description: "Pag-unawa sa dignidad ng tao at ang batayan ng paggalang sa sarili at sa kapuwa.",
    days: [
      {
        title: "Day 1",
        activities: [
          { 
            type: "video", 
            title: "Watch Video Lesson",
            videoId: "lesson2video1"
          },
          { 
            type: "reading", 
            title: "Read Lesson",
            content: "Lesson 2 Day 1 dummy content.\n\n\nParagraph 1: Etiam euismod, justo nec facilisis cursus, sapien erat cursus enim, nec dictum massa enim nec velit.\n\n\nParagraph 2: Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas."
          },
          { 
            type: "quiz", 
            title: "Short exercise"
          }
        ]
      },
      {
        title: "Day 2",
        activities: [
          { 
            type: "video", 
            title: "Watch Video Lesson",
            videoId: "lesson2video2"
          },
          { 
            type: "reading", 
            title: "Read Lesson",
            content: "Lesson 2 Day 2 dummy content.\n\n\nParagraph 1: Sed euismod, nunc ut laoreet dictum, enim erat facilisis urna, nec dictum massa enim nec velit.\n\n\nParagraph 2: Proin ac neque nec erat cursus dictum. Suspendisse potenti."
          }
        ]
      }
    ]
  }
};