/**
 * Contract Test for EventBus
 * Validates that cart:add events follow the expected schema
 * 
 * Run with: node contract.test.js
 */

// Simple EventBus simulation for Node.js environment
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback, source = 'unknown') {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    const wrappedCallback = (data) => {
      console.log(`[EventBus] ↓ ${event} (handled by ${source})`);
      callback(data);
    };
    wrappedCallback.__originalCallback = callback;
    this.listeners[event].push(wrappedCallback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      cb => cb.__originalCallback !== callback && cb !== callback
    );
  }

  emit(event, data) {
    console.log(`[EventBus] ↑ ${event}`, JSON.stringify(data));
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener:`, error.message);
        throw error;
      }
    });
  }
}

// Contract validation
const validateCartAddPayload = (payload) => {
  const errors = [];

  // Check required fields
  if (!('id' in payload)) {
    errors.push('Missing required field: id (should be number)');
  } else if (typeof payload.id !== 'number') {
    errors.push(`Invalid type for id: got ${typeof payload.id}, expected number`);
  }

  if (!('name' in payload)) {
    errors.push('Missing required field: name (should be string)');
  } else if (typeof payload.name !== 'string') {
    errors.push(`Invalid type for name: got ${typeof payload.name}, expected string`);
  }

  if (!('price' in payload)) {
    errors.push('Missing required field: price (should be number)');
  } else if (typeof payload.price !== 'number') {
    errors.push(`Invalid type for price: got ${typeof payload.price}, expected number`);
  }

  if (!('image' in payload)) {
    errors.push('Missing required field: image (should be string)');
  } else if (typeof payload.image !== 'string') {
    errors.push(`Invalid type for image: got ${typeof payload.image}, expected string`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Test runner
const runTests = () => {
  const eventBus = new EventBus();
  let testsPassed = 0;
  let testsFailed = 0;

  console.log('\n========================================');
  console.log('  Cart:Add Contract Validation Tests');
  console.log('========================================\n');

  // Test 1: Valid payload
  console.log('✓ Test 1: Valid cart:add payload');
  const validPayload = {
    id: 1,
    name: 'Manette SNES',
    price: 29,
    image: 'snes'
  };

  let test1Passed = false;
  try {
    const validation = validateCartAddPayload(validPayload);
    if (validation.valid) {
      console.log('  ✅ Validation passed');
      eventBus.emit('cart:add', validPayload);
      test1Passed = true;
      testsPassed++;
    } else {
      console.log('  ❌ Validation failed:', validation.errors);
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    testsFailed++;
  }
  console.log('');

  // Test 2: Invalid payload - missing field
  console.log('✗ Test 2: Invalid payload - missing "price" field');
  const invalidPayload1 = {
    id: 2,
    name: 'Cartouche Zelda',
    image: 'zelda'
    // Missing price
  };

  try {
    const validation = validateCartAddPayload(invalidPayload1);
    if (!validation.valid) {
      console.log('  ✅ Correctly detected as invalid');
      console.log('  Errors:', validation.errors);
      testsPassed++;
    } else {
      console.log('  ❌ Should have detected as invalid');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    testsFailed++;
  }
  console.log('');

  // Test 3: Invalid payload - wrong type
  console.log('✗ Test 3: Invalid payload - "price" should be number, not string');
  const invalidPayload2 = {
    id: 3,
    name: 'Game Boy Color',
    price: '89', // Should be number, not string
    image: 'gbc'
  };

  try {
    const validation = validateCartAddPayload(invalidPayload2);
    if (!validation.valid) {
      console.log('  ✅ Correctly detected as invalid');
      console.log('  Errors:', validation.errors);
      testsPassed++;
    } else {
      console.log('  ❌ Should have detected as invalid');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    testsFailed++;
  }
  console.log('');

  // Test 4: Invalid payload - multiple type errors
  console.log('✗ Test 4: Invalid payload - multiple type errors');
  const invalidPayload3 = {
    id: 'not-a-number',
    name: 123, // Should be string
    price: 45,
    image: 'zelda'
  };

  try {
    const validation = validateCartAddPayload(invalidPayload3);
    if (!validation.valid) {
      console.log('  ✅ Correctly detected as invalid');
      console.log('  Errors:');
      validation.errors.forEach(err => console.log('    -', err));
      testsPassed++;
    } else {
      console.log('  ❌ Should have detected as invalid');
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    testsFailed++;
  }
  console.log('');

  // Test 5: Valid payload with extra fields (should still pass)
  console.log('✓ Test 5: Valid payload with extra fields');
  const validPayloadWithExtra = {
    id: 4,
    name: 'Cable AV Retro',
    price: 12,
    image: 'cable',
    category: 'accessoires', // Extra field
    quantity: 1 // Extra field
  };

  try {
    const validation = validateCartAddPayload(validPayloadWithExtra);
    if (validation.valid) {
      console.log('  ✅ Validation passed (extra fields allowed)');
      testsPassed++;
    } else {
      console.log('  ❌ Validation failed:', validation.errors);
      testsFailed++;
    }
  } catch (e) {
    console.log('  ❌ Error:', e.message);
    testsFailed++;
  }
  console.log('');

  // Summary
  console.log('========================================');
  console.log(`  Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('========================================\n');

  if (testsFailed === 0) {
    console.log('✅ All contract tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
};

// Run tests
runTests();
