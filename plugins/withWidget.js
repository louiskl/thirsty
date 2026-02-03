const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const WIDGET_NAME = 'ThirstyWidget';
const WIDGET_BUNDLE_ID = 'com.louiskl.thirsty.widget';
const DEVELOPMENT_TEAM = '"LOUIS MANUEL KLINKE"';

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

function withWidget(config) {
  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const iosPath = path.join(projectRoot, 'ios');
    const nativeWidgetPath = path.join(projectRoot, 'native', 'ios', WIDGET_NAME);
    const widgetPath = path.join(iosPath, WIDGET_NAME);

    // Copy widget files from native/ios to ios
    if (fs.existsSync(nativeWidgetPath)) {
      console.log(`📦 Copying ${WIDGET_NAME} files to ios folder...`);
      copyFolderRecursiveSync(nativeWidgetPath, widgetPath);
    } else {
      console.log(`Widget source folder not found at ${nativeWidgetPath}, skipping widget configuration`);
      return config;
    }

    // Add the widget group
    const widgetGroup = xcodeProject.addPbxGroup(
      [
        'ThirstyWidgetBundle.swift',
        'ThirstyWidget.swift',
        'WaterGlassView.swift',
        'AddWaterIntent.swift',
        'Colors.swift',
        'Info.plist',
        'ThirstyWidget.entitlements',
        'Assets.xcassets',
      ],
      WIDGET_NAME,
      WIDGET_NAME
    );

    // Add to main group
    const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;
    xcodeProject.addToPbxGroup(widgetGroup.uuid, mainGroup);

    // Add widget extension target (this automatically adds embed phase)
    const target = xcodeProject.addTarget(
      WIDGET_NAME,
      'app_extension',
      WIDGET_NAME,
      WIDGET_BUNDLE_ID
    );

    // Add build phase for sources
    xcodeProject.addBuildPhase(
      [
        'ThirstyWidgetBundle.swift',
        'ThirstyWidget.swift',
        'WaterGlassView.swift',
        'AddWaterIntent.swift',
        'Colors.swift',
      ],
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid,
      'app_extension',
      `"${WIDGET_NAME}"`
    );

    // Add resources build phase
    xcodeProject.addBuildPhase(
      ['Assets.xcassets'],
      'PBXResourcesBuildPhase',
      'Resources',
      target.uuid,
      'app_extension',
      `"${WIDGET_NAME}"`
    );

    // Get target build configurations and update settings
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key of Object.keys(configurations)) {
      const buildConfig = configurations[key];
      if (buildConfig && buildConfig.buildSettings && buildConfig.name) {
        const buildConfigList = xcodeProject.hash.project.objects['XCConfigurationList'];
        for (const listKey of Object.keys(buildConfigList)) {
          const list = buildConfigList[listKey];
          if (list && list.buildConfigurations) {
            const hasConfig = list.buildConfigurations.some(
              bc => (typeof bc === 'object' ? bc.value : bc) === key
            );
            if (hasConfig && xcodeProject.hash.project.objects['XCConfigurationList'][`${listKey}_comment`]?.includes(WIDGET_NAME)) {
              // This is a widget configuration - update build settings
              buildConfig.buildSettings.ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = 'AccentColor';
              buildConfig.buildSettings.ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME = 'WidgetBackground';
              buildConfig.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`;
              buildConfig.buildSettings.CODE_SIGN_STYLE = 'Automatic';
              buildConfig.buildSettings.CURRENT_PROJECT_VERSION = 1;
              buildConfig.buildSettings.DEVELOPMENT_TEAM = DEVELOPMENT_TEAM;
              buildConfig.buildSettings.GENERATE_INFOPLIST_FILE = 'YES';
              buildConfig.buildSettings.INFOPLIST_FILE = `"${WIDGET_NAME}/Info.plist"`;
              buildConfig.buildSettings.INFOPLIST_KEY_CFBundleDisplayName = 'Thirsty';
              buildConfig.buildSettings.INFOPLIST_KEY_NSHumanReadableCopyright = '""';
              buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '17.0';
              buildConfig.buildSettings.LD_RUNPATH_SEARCH_PATHS = '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
              buildConfig.buildSettings.MARKETING_VERSION = '1.0';
              buildConfig.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${WIDGET_BUNDLE_ID}"`;
              buildConfig.buildSettings.PRODUCT_NAME = '"$(TARGET_NAME)"';
              buildConfig.buildSettings.SKIP_INSTALL = 'YES';
              buildConfig.buildSettings.SWIFT_EMIT_LOC_STRINGS = 'YES';
              buildConfig.buildSettings.SWIFT_VERSION = '5.0';
              buildConfig.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
            }
          }
        }
      }
    }

    // Add target dependency (addTarget should have done this, but ensure it exists)
    const mainTarget = xcodeProject.getFirstTarget();
    xcodeProject.addTargetDependency(mainTarget.uuid, [target.uuid]);

    console.log(`✅ Added ${WIDGET_NAME} extension to Xcode project`);
    
    return config;
  });

  return config;
}

module.exports = withWidget;
