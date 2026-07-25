// backend/src/__tests__/dsa/verdictEngine.test.ts

import { ComparatorEngine } from '../../features/dsa/comparatorEngine';

describe('ComparatorEngine Unit Tests', () => {
  it('correctly compares EXACT string and number representations', () => {
    expect(ComparatorEngine.compare("4", "4", "EXACT")).toBe(true);
    expect(ComparatorEngine.compare("[0,1]", "[0,1]", "EXACT")).toBe(true);
    expect(ComparatorEngine.compare("4", "5", "EXACT")).toBe(false);
  });

  it('correctly compares UNORDERED_ARRAY outputs', () => {
    expect(ComparatorEngine.compare("[1,0]", "[0,1]", "UNORDERED_ARRAY")).toBe(true);
    expect(ComparatorEngine.compare("[2,1]", "[1,2]", "UNORDERED_ARRAY")).toBe(true);
    expect(ComparatorEngine.compare("[1,2]", "[1,3]", "UNORDERED_ARRAY")).toBe(false);
  });

  it('correctly compares LINKED_LIST outputs', () => {
    expect(ComparatorEngine.compare("[5,4,3,2,1]", "[5,4,3,2,1]", "LINKED_LIST")).toBe(true);
  });

  it('correctly compares TREE outputs with trailing null trimming', () => {
    expect(ComparatorEngine.compare("[4,7,2,9,6,3,1,null,null]", "[4,7,2,9,6,3,1]", "TREE")).toBe(true);
  });

  it('correctly compares DESIGN command outputs', () => {
    expect(ComparatorEngine.compare("[null,null,null,1,1,false]", "[null,null,null,1,1,false]", "DESIGN")).toBe(true);
  });

  it('respects comparator options like ignoreTrailingSpaces and ignoreCase', () => {
    expect(ComparatorEngine.compare("Hello \n ", "hello", "EXACT", { ignoreCase: true, ignoreTrailingSpaces: true, ignoreNewLines: true })).toBe(true);
  });
});
