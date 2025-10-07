import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const leaderboardScreenStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#4A3AFF',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll view styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  activeTabText: {
    color: '#AF52DE',
  },

  // User position card styles
  userPositionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    padding: 20,
  },
  positionBadge: {
    backgroundColor: 'rgba(255,215,0,0.9)',
    borderRadius: 15,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  positionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    marginBottom: 4,
  },
  positionSubtitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  trophyIcon: {
    width: 40,
    height: 40,
    marginLeft: 8,
  },

  // Loading styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },

  // Podium styles
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginHorizontal: 10,
    marginBottom: 40,
    paddingTop: 20,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    flex: 1,
  },
  podiumPlayerInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePicture: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  firstPlaceXP: {
    backgroundColor: '#FFD700',
  },
  thirdPlaceXP: {
    backgroundColor: '#FF8C42',
  },
  xpText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
  },
  podiumBlock: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumImage: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  podiumNumber: {
    width: 50,
    height: 50,
    marginTop: 10,
  },

  // List styles
  listContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  currentUserItem: {
    backgroundColor: 'rgba(175, 82, 222, 0.1)',
  },
  listRankContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  listRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  currentUserText: {
    color: '#AF52DE',
  },
  listPlayerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listPlayerPoints: {
    fontSize: 14,
    color: '#666',
  },
  currentUserSubText: {
    color: '#AF52DE',
    opacity: 0.8,
  },
  flagContainer: {
    marginLeft: 8,
  },
  flag: {
    width: 20,
    height: 12,
    borderRadius: 2,
  },

  // View More Button
  viewMoreButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  viewMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  modalContent: {
    flex: 1,
    paddingTop: 10,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalCurrentUserItem: {
    backgroundColor: '#f0e6ff',
    borderWidth: 2,
    borderColor: '#AF52DE',
  },
  modalRankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  modalRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  modalCurrentUserText: {
    color: '#AF52DE',
  },
  modalPlayerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modalPlayerPoints: {
    fontSize: 14,
    color: '#666',
  },
  modalCurrentUserSubText: {
    color: '#AF52DE',
    opacity: 0.8,
  },
  medalContainer: {
    marginLeft: 8,
  },
});