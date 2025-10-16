import { StyleSheet } from 'react-native';

export const homeScreenStyles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },

  // Top bar styles
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 50,
  },
  topIcons: {
    flexDirection: "row",
    gap: 15,
  },
  icon: {
    width: 24,
    height: 24,
  },

  // Search bar styles
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: "#555",
  },

  // Welcome card styles
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    height: 220,
    elevation: 8,
    shadowColor: '#6D5FFD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  welcomeContent: {
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingRight: 100,
    height: '100%',
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 20,
    right: 15,
    width: 120,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascot: {
    width: 170,
    height: 170,
  },
  welcomeText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: '400',
    lineHeight: 26,
  },
  learnIT: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 2,
    lineHeight: 32,
  },
  subText: {
    fontSize: 14,
    color: "#E8E3FF",
    marginVertical: 8,
    lineHeight: 18,
    opacity: 0.9,
  },
  startButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },


  // Tab styles
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    marginRight: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#EAEAEA",
    fontSize: 14,
    color: "#555",
  },
  tabActive: {
    backgroundColor: "#4A3AFF",
    color: "#fff",
  },

  // Card styles
  exploreLessonsCard: {
    borderRadius: 16,
    marginBottom: 16,
    height: 120,
    overflow: 'hidden',
  },
  cardBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  cardOverlay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  cardIcon: {
    width: 60,
    height: 60,
    opacity: 0.9,
    tintColor: '#fff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Leaderboard styles
  leaderboardContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    marginTop: -4,
    tintColor: '#333',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  positionContainer: {
    width: 40,
    alignItems: 'center',
  },
  position: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  topThreePosition: {
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 12,
    color: '#666',
  },
  xpBar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Announcements styles
  announcementsContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
    textAlign: 'center',
  },
  announcementsList: {
    gap: 16,
  },
  announcementItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementTeacher: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },

  // Error handling styles
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});