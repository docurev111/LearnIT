// Hide the navigation header
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LESSON_CONTENT } from '../../constants/lessonContent';
import { recordActivityCompletion } from '../../services/activityService';

const { width, height } = Dimensions.get('window');

export default function LessonFlashcardScreen() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [mode, setMode] = useState<'question' | 'term'>('question');
	const [isCompleted, setIsCompleted] = useState(false);
	const [isCompleting, setIsCompleting] = useState(false);
	const flipAnim = useRef(new Animated.Value(0)).current;
	const router = useRouter();
	const { lessonId, day } = useLocalSearchParams();

	const lessonContent = LESSON_CONTENT[lessonId as string];
	const dayIndex = parseInt(day as string) - 1;
	const FLASHCARDS = lessonContent?.days[dayIndex]?.flashcards || [];

	if (!lessonContent || !FLASHCARDS.length) {
		return (
			<LinearGradient
				colors={["#2E26D9", "#3B2DCB", "#4330C3"]}
				style={styles.container}
			>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
							<Ionicons name="arrow-back" size={24} color="#333" />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Flashcards</Text>
						<TouchableOpacity onPress={() => setMode(mode === 'question' ? 'term' : 'question')} style={styles.modeButton}>
							<Text style={styles.modeButtonText}>{mode === 'question' ? 'Q' : 'T'}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.center}>
						<Text style={styles.noCardsText}>No flashcards available for this lesson.</Text>
					</View>
				</SafeAreaView>
			</LinearGradient>
		);
	}

		const card = FLASHCARDS[currentIndex];
		const frontText = mode === 'question' ? card.front_question : card.front_term;

		// Always show the term (front) initially, flip to definition (back)
		const flipCard = () => {
			Animated.spring(flipAnim, {
				toValue: isFlipped ? 0 : 180,
				friction: 8,
				tension: 80,
				useNativeDriver: true,
			}).start(() => setIsFlipped(!isFlipped));
		};

		const nextCard = () => {
			if (currentIndex < FLASHCARDS.length - 1) {
				setCurrentIndex(i => i + 1);
				setIsFlipped(false);
				flipAnim.setValue(0);
			}
		};
		const prevCard = () => {
			if (currentIndex > 0) {
				setCurrentIndex(i => i - 1);
				setIsFlipped(false);
				flipAnim.setValue(0);
			}
		};

		const handleCompleteFlashcards = async () => {
			if (isCompleted || isCompleting) return;

			setIsCompleting(true);
			try {
				// Parse parameters for activity completion
				const lessonIdNum = parseInt(lessonId as string) || 1;
				const dayIndexParsed = parseInt(day as string) - 1 || 0; // Convert to 0-based index
				const activityIndex = 3; // Flashcards is the fourth activity (index 0: video, 1: reading, 2: quiz, 3: flashcards)

				const result = await recordActivityCompletion(lessonIdNum, dayIndexParsed, activityIndex, 'flashcards');
				if (result.success) {
					setIsCompleted(true);
					Alert.alert('Success', 'Flashcard practice completed!');
				} else {
					Alert.alert('Error', result.message);
				}
			} catch (error) {
				Alert.alert('Error', 'Failed to mark flashcards as complete');
			} finally {
				setIsCompleting(false);
			}
		};

								const frontAnimatedStyle = {
									transform: [
										{ rotateY: flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }) }
									],
									position: 'absolute' as const,
									width: CARD_WIDTH,
									height: CARD_HEIGHT,
									opacity: flipAnim.interpolate({ inputRange: [0, 90], outputRange: [1, 0], extrapolate: 'clamp' }),
								};
								const backAnimatedStyle = {
									transform: [
										{ rotateY: flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] }) }
									],
									position: 'absolute' as const,
									width: CARD_WIDTH,
									height: CARD_HEIGHT,
									opacity: flipAnim.interpolate({ inputRange: [90, 180], outputRange: [0, 1], extrapolate: 'clamp' }),
								};

		return (
			<LinearGradient
				colors={["#2E26D9", "#3B2DCB", "#4330C3"]}
				style={styles.container}
			>
				<SafeAreaView style={styles.safeArea}>
					<StatusBar backgroundColor="#2E26D9" barStyle="light-content" translucent={false} />
				{/* Top bar */}
				<View style={styles.topBar}>
					<TouchableOpacity style={styles.topIcon} onPress={() => router.back()}>
						<Ionicons name="close" size={28} color="#E6EEF8" />
					</TouchableOpacity>
					<Text style={styles.topCounter}>{currentIndex + 1} / {FLASHCARDS.length}</Text>
					<TouchableOpacity onPress={() => setMode(mode === 'question' ? 'term' : 'question')} style={styles.topModeButton}>
						<Text style={styles.topModeButtonText}>{mode === 'question' ? 'Q' : 'T'}</Text>
					</TouchableOpacity>
				</View>
				{/* Progress bar */}
				<View style={styles.progressTrack}>
					<View style={[styles.progressFill, { width: `${((currentIndex + 1) / FLASHCARDS.length) * 100}%` }]} />
				</View>
				{/* Card */}
				<View style={styles.content}>
					<TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={styles.cardTouchable}>
						<View style={styles.cardWrapper}>
							<Animated.View style={frontAnimatedStyle}>
								<View style={styles.cardSide}>
									<Ionicons name="star-outline" size={24} color="#B1B5D3" style={styles.starIcon} />
									<Text style={styles.cardText} numberOfLines={20}>{frontText}</Text>
								</View>
							</Animated.View>
							<Animated.View style={backAnimatedStyle}>
								<View style={[styles.cardSide, styles.cardBack]}>
									<Ionicons name="star" size={24} color="#FFD700" style={styles.starIcon} />
									<Text style={styles.cardText} numberOfLines={20}>{card.back}</Text>
								</View>
							</Animated.View>
						</View>
					</TouchableOpacity>
				</View>
				{/* Bottom bar */}
				<View style={styles.bottomBar}>
					{currentIndex === FLASHCARDS.length - 1 ? (
						// Show completion button on last card
						<TouchableOpacity 
							style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
							onPress={handleCompleteFlashcards}
							disabled={isCompleting || isCompleted}
						>
							<Ionicons 
								name={isCompleting ? "time" : (isCompleted ? "checkmark-circle" : "checkmark")} 
								size={20} 
								color="#fff" 
								style={styles.buttonIcon}
							/>
							<Text style={styles.completeButtonText}>
								{isCompleting ? 'Completing...' : (isCompleted ? 'Completed!' : 'Complete Practice')}
							</Text>
						</TouchableOpacity>
					) : (
						// Show navigation controls for other cards
						<>
							<TouchableOpacity onPress={prevCard} style={styles.bottomIcon} disabled={currentIndex === 0}>
								<Ionicons name="arrow-undo" size={24} color={currentIndex === 0 ? 'rgba(255,255,255,0.3)' : '#E6EEF8'} />
							</TouchableOpacity>
							<Text style={styles.bottomText}>Tap the card to flip</Text>
							<TouchableOpacity onPress={nextCard} style={styles.bottomIcon} disabled={currentIndex === FLASHCARDS.length - 1}>
								<Ionicons name="play" size={24} color={currentIndex === FLASHCARDS.length - 1 ? 'rgba(255,255,255,0.3)' : '#E6EEF8'} />
							</TouchableOpacity>
						</>
					)}
				</View>
			</SafeAreaView>
		</LinearGradient>
		);
}

const CARD_WIDTH = width - 48;
const CARD_HEIGHT = height * 0.55;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	topBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 18,
		height: 56,
		marginTop: 8,
	},
	topIcon: {
		padding: 4,
	},
	topCounter: {
		color: '#E6EEF8',
		fontSize: 20,
		fontWeight: '600',
		letterSpacing: 1,
	},
	progressTrack: {
		height: 2,
		backgroundColor: '#23244A',
		width: '100%',
		marginBottom: 16,
	},
	progressFill: {
		height: 2,
		backgroundColor: '#B1B5D3',
		borderRadius: 2,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cardTouchable: {
		width: '100%',
		alignItems: 'center',
	},
	cardWrapper: {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cardSide: {
		width: '100%',
		height: '100%',
		backgroundColor: '#ffffffff',
		borderRadius: 24,
		paddingHorizontal: 24,
		paddingTop: 32,
		paddingBottom: 48,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.18,
		shadowRadius: 16,
		elevation: 8,
		backfaceVisibility: 'hidden',
		},
	cardBack: {
		backgroundColor: '#ffffffff',
	},
	starIcon: {
		position: 'absolute',
		top: 18,
		right: 18,
	},
	cardText: {
		color: '#000000ff',
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
		letterSpacing: 1,
		marginBottom: 0,
		lineHeight: 24,
	},
	bottomBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingBottom: 18,
		height: 56,
		backgroundColor: 'transparent',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 20,
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
		marginLeft: 16,
	},
	modeButton: {
		padding: 8,
		backgroundColor: '#B1B5D3',
		borderRadius: 8,
	},
	modeButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	topModeButton: {
		padding: 8,
		backgroundColor: '#23244A',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#B1B5D3',
	},
	topModeButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#E6EEF8',
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	noCardsText: {
		fontSize: 18,
		color: '#666',
		textAlign: 'center',
	},
	bottomIcon: {
		padding: 8,
	},
	bottomText: {
		color: '#E6EEF8',
		fontSize: 16,
		fontWeight: '400',
		letterSpacing: 0.5,
	},
	completeButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#10B981',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		minWidth: 180,
	},
	completeButtonDisabled: {
		backgroundColor: '#6B7280',
	},
	buttonIcon: {
		marginRight: 8,
	},
	completeButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});
