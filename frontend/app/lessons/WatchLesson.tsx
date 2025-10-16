import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recordActivityCompletion } from '../../services/activityService';

type WatchLessonProps = {
    title: string;
    youtubeId: string;
};

const WatchLesson: React.FC<WatchLessonProps> = ({ title, youtubeId }) => {
    const params = useLocalSearchParams();
    const videoId = params.videoId || youtubeId;
    const windowWidth = Dimensions.get('window').width;
    const videoWidth = Math.min(windowWidth - 16, 560);
    const videoHeight = (videoWidth * 9) / 12; // Taller aspect ratio

    // Get lessonTitle and day from params if available
    let lessonTitle = params.lessonTitle || title;
    if (Array.isArray(lessonTitle)) {
        lessonTitle = lessonTitle[0];
    }
    let dayNumber = params.day || params.dayNumber || '';
    if (Array.isArray(dayNumber)) {
        dayNumber = dayNumber[0];
    }
    let lessonIdStr = params.lessonId || '1';
    if (Array.isArray(lessonIdStr)) {
        lessonIdStr = lessonIdStr[0];
    }

    // Compose title with day number
    const screenTitle = dayNumber ? `Day ${dayNumber} | ${lessonTitle}` : lessonTitle;

    // State for completion tracking
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Parse parameters for activity completion
    const lessonId = parseInt(lessonIdStr) || 1;
    const dayIndex = parseInt(dayNumber) - 1 || 0; // Convert to 0-based index
    const activityIndex = 0; // Video is typically the first activity in a day

    const handleMarkAsWatched = async () => {
        if (isCompleted || isCompleting) return;

        setIsCompleting(true);
        try {
            const result = await recordActivityCompletion(lessonId, dayIndex, activityIndex, 'video');
            if (result.success) {
                setIsCompleted(true);
                Alert.alert('Success', 'Video marked as watched!');
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to mark video as watched');
        } finally {
            setIsCompleting(false);
        }
    };

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerBackVisible: true, title: 'Watch Lesson' }} />
            <Text style={styles.title}>{screenTitle}</Text>
            <View style={[styles.videoWrapper, { width: videoWidth, height: videoHeight }]}> 
                <WebView
                    style={{ borderRadius: 16, overflow: 'hidden', width: videoWidth, height: videoHeight, backgroundColor: '#000' }}
                    javaScriptEnabled
                    allowsFullscreenVideo={true}
                    source={{ uri: `https://www.youtube.com/embed/${videoId}?playsinline=1` }}
                    onLoad={handleVideoLoad}
                />
            </View>
            
            {isVideoLoaded && !isCompleted && (
                <TouchableOpacity 
                    style={[styles.completeButton, isCompleting && styles.completeButtonDisabled]}
                    onPress={handleMarkAsWatched}
                    disabled={isCompleting}
                >
                    <Ionicons 
                        name={isCompleting ? "time" : "checkmark-circle"} 
                        size={24} 
                        color="#fff" 
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.completeButtonText}>
                        {isCompleting ? 'Marking as Watched...' : 'Mark as Watched'}
                    </Text>
                </TouchableOpacity>
            )}

            {isCompleted && (
                <View style={styles.completedContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    <Text style={styles.completedText}>Video Watched</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    videoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'left',
        color: '#000',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        minWidth: 200,
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
    completedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        minWidth: 200,
    },
    completedText: {
        color: '#065F46',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default WatchLesson;