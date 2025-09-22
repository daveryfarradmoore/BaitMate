import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Navigation = { navigate: (screen: string, params?: unknown) => void };
type Route = { params: { selectedSpecies?: { name?: string }; hasGear?: boolean; ownedGroups?: string[] } };

interface Props { navigation: Navigation; route: Route }

const MethodQuestionScreen = ({ navigation, route }: Props) => {
  const { selectedSpecies, hasGear, ownedGroups } = route.params;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions: { id: string; question: string; options: { id: string; text: string; icon: string }[] }[] = [
    {
      id: 'location',
      question: 'Where will you be fishing?',
      options: [
        { id: 'shore', text: 'From Shore', icon: 'location' },
        { id: 'wading', text: 'Wading', icon: 'water' },
        { id: 'boat', text: 'From Boat', icon: 'boat' },
      ]
    },
    {
      id: 'bait',
      question: 'What do you prefer to use?',
      options: [
        { id: 'bait', text: 'Live Bait', icon: 'bug' },
        { id: 'lures', text: 'Artificial Lures', icon: 'fish' },
        { id: 'both', text: 'Both', icon: 'options' },
      ]
    },
    {
      id: 'difficulty',
      question: 'What\'s your experience level?',
      options: [
        { id: 'beginner', text: 'Beginner', icon: 'school' },
        { id: 'intermediate', text: 'Some Experience', icon: 'person' },
        { id: 'advanced', text: 'Experienced', icon: 'trophy' },
      ]
    }
  ];

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, show results or recommendations
      handleFinish();
    }
  };

  const handleFinish = () => {
    navigation.navigate('GearRecommendation', {
      species: selectedSpecies,
      method: answers.location || 'Shore Fishing',
      gearOwned: ownedGroups && ownedGroups.length > 0 ? ownedGroups : hasGear,
    });
  };

  const currentQ = questions[currentQuestion]!;
  const hasAnswered = answers[currentQ.id];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestion + 1} of {questions.length}
          </Text>
        </View>
        
        <Text style={styles.title}>{currentQ.question}</Text>
        <Text style={styles.subtitle}>
          This helps us recommend the best gear for {selectedSpecies?.name}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {currentQ.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                answers[currentQ.id] === option.id && styles.selectedCard,
              ]}
              onPress={() => handleAnswerSelect(currentQ.id, option.id)}
            >
              <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={option.icon as any} size={24} color="#6b7280" />
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </View>
              {answers[currentQ.id] === option.id && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !hasAnswered && styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={!hasAnswered}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === questions.length - 1 ? 'Get Recommendations' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  checkmark: {
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  nextButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default MethodQuestionScreen; 