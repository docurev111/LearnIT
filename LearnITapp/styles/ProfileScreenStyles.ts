import { StyleSheet } from 'react-native';

export const profileScreenStyles = StyleSheet.create({
  // Container styles
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  
  // Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },

  // Profile section styles
  profileSection: { 
    alignItems: "center", 
    marginVertical: 12 
  },
  avatarContainer: { 
    position: 'relative',
    marginBottom: 8,
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50 
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6c63ff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginTop: 8 
  },

  // Badge styles
  badgesRow: { 
    flexDirection: "row", 
    marginTop: 6 
  },
  badge: {
    backgroundColor: "#6c63ff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  badgeText: { 
    color: "#fff", 
    fontSize: 12 
  },
  badgeGray: {
    backgroundColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  badgeTextGray: { 
    color: "#333", 
    fontSize: 12 
  },

  // Points and progress styles
  pointsContainer: { 
    alignItems: "center", 
    marginVertical: 12 
  },
  pointsLabel: { 
    fontSize: 12, 
    color: "#777" 
  },
  progressBar: {
    width: "80%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginVertical: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6c63ff",
    borderRadius: 4,
  },
  pointsValue: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#6c63ff" 
  },

  // Tasks section styles
  tasksContainer: { 
    paddingHorizontal: 16, 
    marginTop: 10 
  },
  tasksTitle: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  tasksSubtitle: { 
    fontSize: 13, 
    color: "#777", 
    marginBottom: 10 
  },
  taskStatsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  taskCard: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  taskNumber: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginTop: 4, 
    color: "#6c63ff" 
  },
  taskLabel: { 
    fontSize: 12, 
    color: "#555", 
    textAlign: "center" 
  },

  // Tab styles
  tabRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6c63ff",
    marginHorizontal: 4,
  },
  tabActive: { 
    backgroundColor: "#6c63ff" 
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#6c63ff" 
  },
  tabTextActive: { 
    color: "#fff" 
  },

  // Achievement styles
  achievementList: {
    padding: 16,
    flex: 1,
  },
  achievementCard: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  achievementIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementGif: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: { 
    fontSize: 14, 
    fontWeight: "bold", 
    marginBottom: 4,
  },
  achievementDesc: { 
    fontSize: 12, 
    color: "#555", 
    marginBottom: 6,
  },
  lockedCard: { 
    backgroundColor: "#eee" 
  },
  lockedText: { 
    color: "#aaa" 
  },
  achievementIconText: {
    fontSize: 40,
    marginRight: 12,
  },
  rarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  rarityBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },

  // Stats styles
  statsContainer: { 
    padding: 20, 
    alignItems: "center" 
  },
  statsText: { 
    fontSize: 16, 
    color: "#555" 
  },
  statCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6c63ff",
    textAlign: "center",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  rarityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rarityLabel: {
    fontSize: 14,
    color: "#333",
    textTransform: "capitalize",
  },
  rarityCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c63ff",
  },
  recentBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  recentBadgeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recentBadgeName: {
    fontSize: 14,
    color: "#333",
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777",
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ccc",
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
});