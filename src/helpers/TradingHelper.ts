// // helpers/order-helpers.js
// import { TradingPage } from '../pages/TradingPage';

// export class OrderHelpers {
//   async setupRandomOrder(
//     TradingPage, 
//     config = { price: { min: 300000, max: 500000 } }
//   ) {
//     console.log('🎲 Setting random order parameters (min price 300000)...');
    
//     // Set random price
//     const randomPrice = await TradingPage.setRandomPrice(
//       config.price.min, 
//       config.price.max
//     );
    
//     // Verify minimum price requirement
//     const priceValue = parseFloat(randomPrice.replace(/,/g, ''));
//     if (priceValue < config.price.min) {
//       throw new Error(`Price ${priceValue} is below minimum required ${config.price.min}`);
//     }
    
//     // Set volume to 28%
//     const actualVolume = await TradingPage.setVolumeToPercentage(28);
    
//     // Click screenshot button
//     await TradingPage.clickScreenshotButton();

//     return {
//       price: randomPrice,
//       volume: actualVolume,
//       type: 'Limit'
//     };
//   }
// }