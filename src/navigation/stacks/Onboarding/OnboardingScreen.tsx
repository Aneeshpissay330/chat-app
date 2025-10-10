import React from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import OnboardingScaffold from '../../../components/OnboardingScaffold';
import cards from './data';

type Props = {
  route: { params: { index: number } };
};

export default function OnboardingScreen({ route }: Props) {
  const nav = useNavigation() as any;
  const index = route?.params?.index ?? 0;
  const card = cards[index];

  function onNext() {
    if (index < cards.length - 1) {
      nav.dispatch(StackActions.replace('Onboarding_' + (index + 2), { index: index + 1 }));
    } else {
      // Finished onboarding - navigate to main stacks
      nav.navigate('Tabs');
    }
  }

  function onSkip() {
    nav.navigate('Tabs');
  }

  function onClose() {
    nav.navigate('Tabs');
  }

  function onGoTo(i: number) {
    if (i >= 0 && i < cards.length) {
      // replace current screen with the chosen one so back doesn't stack
      nav.dispatch(StackActions.replace('Onboarding_' + (i + 1), { index: i }));
    }
  }

  return (
    <OnboardingScaffold
      title={card.title}
      lines={card.lines}
      image={card.image}
      index={index}
      total={cards.length}
      onNext={onNext}
      onSkip={onSkip}
      onClose={onClose}
      onGoTo={onGoTo}
    />
  );
}
