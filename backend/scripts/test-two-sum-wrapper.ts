// backend/scripts/test-two-sum-wrapper.ts

import { ProblemLoader } from '../src/features/dsa/problemLoader';
import { WrapperGenerator } from '../src/features/dsa/wrapperGenerator';
import { IOFramework } from '../src/features/dsa/io';

const userCodeWithoutMain = `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (mp.find(comp) != mp.end()) {
                return {mp[comp], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`;

const prob = ProblemLoader.loadDirectoryProblem('two-sum');
if (!prob) {
  console.error('Failed to load two-sum');
  process.exit(1);
}

console.log('--- StarterMetadata ---');
console.log(JSON.stringify(prob.starterMetadata, null, 2));

console.log('\n--- IOFramework Generated Driver ---');
const generatedDriver = IOFramework.buildAndRender(prob.starterMetadata, 'cpp');
console.log(generatedDriver);

console.log('\n--- Execution Engine Wrapper ---');
const wrappedCode = WrapperGenerator.generateWrapper(
  prob.starterMetadata,
  prob.executionMetadata,
  userCodeWithoutMain,
  'cpp',
  prob.driverMetadata
);

console.log(wrappedCode);
console.log('\n✅ Wrapper successfully generated for two-sum without main()!');
