# TODO for Lesson Modal Update Task

## Pending Steps:
- [ ] Test the implementation: Run the app, verify video playback, navigation flow, and flashcard functionality.
- [ ] Update TODO.md: Mark steps as completed after each one.

## Completed Steps:
- [x] Update `app/LessonIntroModalSimple.tsx`: Add Video import and component with play/pause controls above the description text. Modify handleStartLesson to navigate to `/LessonChoiceScreen` instead of `/LessonSimpleScreen`.
- [x] Create `app/LessonChoiceScreen.tsx`: Implement choice screen with two cards - "Read Lesson" (nav to LessonSimpleScreen) and "Let's use Flashcards!" (nav to LessonFlashcardScreen).
- [x] Create `app/LessonFlashcardScreen.tsx`: Implement reusable flashcard screen with sample cards for Lesson 1, flip animation, navigation, and completion logic.
