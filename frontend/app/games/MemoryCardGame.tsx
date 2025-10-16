import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 4; // 4 columns with padding

// Filipino Values Card Pairs
const CARD_PAIRS = [
  { id: 1, value: 'KATAPATAN', definition: 'Pagiging tapat sa lahat', color: '#FFD700' },
  { id: 2, value: 'PAGGALANG', definition: 'Pagrespeto sa kapwa', color: '#FF6B6B' },
  { id: 3, value: 'PAKIKIPAGKAPWA', definition: 'Pagtrato nang maayos', color: '#4ECDC4' },
  { id: 4, value: 'UTANG NA LOOB', definition: 'Pagpapasalamat', color: '#95E1D3' },
  { id: 5, value: 'PAGMAMALASAKIT', definition: 'Pag-aalaga sa iba', color: '#F38181' },
  { id: 6, value: 'KAPAKUMBABAAN', definition: 'Pagiging mapagpakumbaba', color: '#AA96DA' },
];

interface Card {
  uniqueId: number;
  pairId: number;
  content: string;
  type: 'value' | 'definition';
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryCardGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [canFlip, setCanFlip] = useState(true);

  // Initialize and shuffle cards
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isGameActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive]);

  const initializeGame = () => {
    const gameCards: Card[] = [];
    let uniqueId = 0;

    CARD_PAIRS.forEach((pair) => {
      // Add value card
      gameCards.push({
        uniqueId: uniqueId++,
        pairId: pair.id,
        content: pair.value,
        type: 'value',
        color: pair.color,
        isFlipped: false,
        isMatched: false,
      });

      // Add definition card
      gameCards.push({
        uniqueId: uniqueId++,
        pairId: pair.id,
        content: pair.definition,
        type: 'definition',
        color: pair.color,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setScore(0);
    setTimer(0);
    setIsGameActive(false);
    setCanFlip(true);
  };

  const handleCardPress = (uniqueId: number) => {
    if (!canFlip) return;

    const card = cards.find((c) => c.uniqueId === uniqueId);
    if (!card || card.isMatched || flippedCards.includes(uniqueId)) return;

    // Start timer on first flip
    if (!isGameActive) {
      setIsGameActive(true);
    }

    const newFlippedCards = [...flippedCards, uniqueId];
    setFlippedCards(newFlippedCards);

    // Flip the card
    setCards((prevCards) =>
      prevCards.map((c) =>
        c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c
      )
    );

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setCanFlip(false);
      setMoves((prev) => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((c) => c.uniqueId === firstId);
      const secondCard = cards.find((c) => c.uniqueId === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.uniqueId === firstId || c.uniqueId === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatchedPairs((prev) => [...prev, firstCard.pairId]);
          setScore((prev) => prev + 10);
          setFlippedCards([]);
          setCanFlip(true);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((c) =>
              c.uniqueId === firstId || c.uniqueId === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setCanFlip(true);
        }, 1500);
      }
    }
  };

  // Check for win
  useEffect(() => {
    if (matchedPairs.length === CARD_PAIRS.length && matchedPairs.length > 0) {
      setIsGameActive(false);
      setTimeout(() => {
        Alert.alert(
          'Ang Galing Mo! 🎉',
          `Nakumpleto mo ang lahat!\n\nPuntos: ${score}\nMga Galaw: ${moves}\nOras: ${formatTime(timer)}`,
          [{ text: 'Maglaro Muli', onPress: initializeGame }]
        );
      }, 500);
    }
  }, [matchedPairs]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Larong Memory: Mga Pagpapahalaga</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Puntos</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mga Galaw</Text>
            <Text style={styles.statValue}>{moves}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Oras</Text>
            <Text style={styles.statValue}>{formatTime(timer)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.gameBoard}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.uniqueId}
            style={[
              styles.card,
              card.isFlipped || card.isMatched ? { backgroundColor: card.color } : styles.cardBack,
              card.isMatched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(card.uniqueId)}
            disabled={!canFlip || card.isMatched || card.isFlipped}
            activeOpacity={0.8}
          >
            {card.isFlipped || card.isMatched ? (
              <Text
                style={[
                  styles.cardText,
                  card.type === 'value' ? styles.valueText : styles.definitionText,
                ]}
                numberOfLines={3}
                adjustsFontSizeToFit
              >
                {card.content}
              </Text>
            ) : (
              <Text style={styles.cardBackText}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={initializeGame}>
        <Text style={styles.resetButtonText}>Maglaro Muli</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardBack: {
    backgroundColor: '#7F8C8D',
  },
  cardMatched: {
    borderWidth: 3,
    borderColor: '#27AE60',
  },
  cardText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#2C3E50',
  },
  valueText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  definitionText: {
    fontSize: 11,
  },
  cardBackText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
