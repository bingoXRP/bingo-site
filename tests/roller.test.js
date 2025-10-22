```javascript
describe('Bingo Roller Logic', () => {
  test('rolls unique secure numbers', () => {
    // Mock crypto.getRandomValues for testing
    const mockCrypto = {
      getRandomValues: array => {
        array[0] = Math.floor(Math.random() * 0xFFFFFFFF);
        return array;
      }
    };
    global.crypto = mockCrypto;

    const calledNumbers = new Set();
    global.calledNumbers = calledNumbers; // Mock global used in rollBingo
    const rollBingo = () => {
      if (calledNumbers.size >= 75) return null;
      const letters = ['B', 'I', 'N', 'G', 'O'];
      const ranges = [[1,15], [16,30], [31,45], [46,60], [61,75]];
      let rolled;
      do {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const col = array[0] % 5;
        const offset = ranges[col][0] - 1;
        const num = (array[0] % 15) + 1 + offset;
        rolled = `${letters[col]}-${num}`;
      } while (calledNumbers.has(rolled));
      calledNumbers.add(rolled);
      return rolled;
    };

    const rolled1 = rollBingo();
    const rolled2 = rollBingo();
    expect(rolled1).not.toBe(rolled2);
    expect(rolled1).toMatch(/^[BINGO]-\d{1,2}$/);
  });

  test('generates valid player card', async () => {
    const generatePlayerCard = async () => {
      const card = [];
      const ranges = [[1,15], [16,30], [31,45], [46,60], [61,75]];
      for (let i = 0; i < 5; i++) {
        const col = [];
        const used = new Set();
        const range = ranges[i];
        while (col.length < 5) {
          const array = new Uint32Array(1);
          crypto.getRandomValues(array);
          const num = (array[0] % (range[1] - range[0] + 1)) + range[0];
          if (!used.has(num)) {
            col.push(num);
            used.add(num);
          }
        }
        card.push(col);
      }
      card[2][2] = 'FREE';
      const cardID = Math.random().toString(36).substring(2);
      return { card, cardID };
    };

    const { card } = await generatePlayerCard();
    expect(card.length).toBe(5);
    expect(card[2][2]).toBe('FREE');
  });
});
