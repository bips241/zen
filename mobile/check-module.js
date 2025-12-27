const { NativeModules } = require('react-native');
console.log('Available Native Modules:', Object.keys(NativeModules).sort());
console.log('SystemUIModule available?', !!NativeModules.SystemUIModule);
