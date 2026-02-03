#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedDataModule, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(int)consumed goal:(int)goal)

RCT_EXTERN_METHOD(addWaterFromWidget:(int)amount)

@end
