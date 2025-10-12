import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Stack } from 'expo-router';

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

    // Compose title with day number
    const screenTitle = dayNumber ? `Day ${dayNumber} | ${lessonTitle}` : lessonTitle;

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
                />
            </View>
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
});

export default WatchLesson;