import { expect } from 'chai';
import { Entity } from '@mesa-engine/core';
import { InteractionHandlerSystem } from './interactionHandlerSystem';
import { AnswerComponent, InteractiveComponent, TextComponent } from '../components';

// Provide a minimal document stub so DOM-touching code paths are no-ops in Node
(global as any).document = { getElementById: () => null };

// Helper to create an entity that represents a letter hex tile
function makeInteractionEntity(letterText: string, clicked: boolean): Entity {
  const entity = new Entity();
  const textComp = entity.putComponent(TextComponent);
  textComp.text = letterText;
  const interactiveComp = entity.putComponent(InteractiveComponent);
  interactiveComp.clicked = clicked;
  interactiveComp.area = [];
  return entity;
}

// Helper to create an entity that represents the candidate answer display
function makeAnswerEntity(currentText: string): Entity {
  const entity = new Entity();
  entity.putComponent(AnswerComponent);
  const textComp = entity.putComponent(TextComponent);
  textComp.text = currentText;
  return entity;
}

describe('InteractionHandlerSystem', () => {
  describe('update', () => {
    let system: InteractionHandlerSystem;

    beforeEach(() => {
      system = new InteractionHandlerSystem();
    });

    it('appends the letter from a clicked tile to the candidate answer', () => {
      const letterEntity = makeInteractionEntity('A', true);
      const answerEntity = makeAnswerEntity('');

      (system as any).interactionFamily = { entities: [letterEntity] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      expect(answerEntity.getComponent(TextComponent).text).to.equal('A');
    });

    it('resets clicked to false on the tile after processing', () => {
      const letterEntity = makeInteractionEntity('B', true);
      const answerEntity = makeAnswerEntity('');

      (system as any).interactionFamily = { entities: [letterEntity] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      expect(letterEntity.getComponent(InteractiveComponent).clicked).to.be.false;
    });

    it('does not modify the answer when the tile is not clicked', () => {
      const letterEntity = makeInteractionEntity('C', false);
      const answerEntity = makeAnswerEntity('');

      (system as any).interactionFamily = { entities: [letterEntity] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      expect(answerEntity.getComponent(TextComponent).text).to.equal('');
    });

    it('appends to existing answer text when a tile is clicked', () => {
      const letterEntity = makeInteractionEntity('E', true);
      const answerEntity = makeAnswerEntity('SPEL');

      (system as any).interactionFamily = { entities: [letterEntity] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      expect(answerEntity.getComponent(TextComponent).text).to.equal('SPELE');
    });

    it('accumulates letters across successive update calls', () => {
      const letterEntity = makeInteractionEntity('L', true);
      const answerEntity = makeAnswerEntity('');

      (system as any).interactionFamily = { entities: [letterEntity] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      letterEntity.getComponent(InteractiveComponent).clicked = true;
      system.update(null as any, 0);

      expect(answerEntity.getComponent(TextComponent).text).to.equal('LL');
    });

    it('handles multiple tiles where only the clicked one appends text', () => {
      const clickedEntity = makeInteractionEntity('X', true);
      const unclickedEntity = makeInteractionEntity('Y', false);
      const answerEntity = makeAnswerEntity('');

      (system as any).interactionFamily = { entities: [clickedEntity, unclickedEntity] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      expect(answerEntity.getComponent(TextComponent).text).to.equal('X');
    });

    it('does nothing when there are no interaction entities', () => {
      const answerEntity = makeAnswerEntity('HELLO');

      (system as any).interactionFamily = { entities: [] };
      (system as any).answerFamily = { entities: [answerEntity] };

      system.update(null as any, 0);

      expect(answerEntity.getComponent(TextComponent).text).to.equal('HELLO');
    });
  });
});
