export type Activity = {
  type: 'video' | 'reading' | 'quiz';
  title: string;
  videoId?: string;
  content?: string;
};

export type DayContent = {
  title: string;
  activities: Activity[];
};

export type LessonContent = {
  title: string;
  description: string;
  days: DayContent[];
};

export const LESSON_CONTENT: Record<string, LessonContent> = {
  "1": {
    title: "Gamit ng Isip at Kilos-loob sa Sariling Pagpapasiya at Pagkilos",
    description: "Araling tungkol sa katangian, gamit, at tunguhin ng isip at kilos-loob.",
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
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet dictum, enim erat facilisis urna, nec dictum massa enim nec velit.\n\n\nDummy paragraph 2: Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.\n\n\nDummy paragraph 3: Proin ac neque nec erat cursus dictum. Suspendisse potenti. Etiam euismod, justo nec facilisis cursus, sapien erat cursus enim, nec dictum massa enim nec velit."
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
            videoId: "xz8GcfIbtOM"
          },
          { 
            type: "reading", 
            title: "Read Lesson",
            content: "This is dummy content for Day 2 reading.\n\n\nParagraph 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n\nParagraph 2: Nullam ac urna eu felis dapibus condimentum sit amet a augue. Sed non neque elit. Sed ut imperdiet nisi. Proin condimentum fermentum nunc."
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