const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const BRIDGE_FOLDER = 'ThirstyWidgetBridge';

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

function withWidgetBridge(config) {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const iosPath = path.join(projectRoot, 'ios');
    const nativeBridgePath = path.join(projectRoot, 'native', 'ios', BRIDGE_FOLDER);
    const bridgePath = path.join(iosPath, BRIDGE_FOLDER);

    // Copy bridge files from native/ios to ios
    if (fs.existsSync(nativeBridgePath)) {
      console.log(`📦 Copying ${BRIDGE_FOLDER} files to ios folder...`);
      copyFolderRecursiveSync(nativeBridgePath, bridgePath);
    } else {
      console.log(`Bridge source folder not found at ${nativeBridgePath}, skipping bridge configuration`);
      return config;
    }

    // Get main target
    const mainTarget = xcodeProject.getFirstTarget();
    const mainTargetUuid = mainTarget.uuid;
    
    // Files to add
    const files = [
      { name: 'SharedDataModule.swift', type: 'sourcecode.swift' },
      { name: 'SharedDataModule.m', type: 'sourcecode.c.objc' },
    ];

    // Create file references and build files
    const fileRefs = [];
    const buildFiles = [];
    
    for (const file of files) {
      const fileRefUuid = xcodeProject.generateUuid();
      const buildFileUuid = xcodeProject.generateUuid();
      
      // Add file reference
      xcodeProject.hash.project.objects['PBXFileReference'][fileRefUuid] = {
        isa: 'PBXFileReference',
        lastKnownFileType: file.type,
        name: file.name,
        path: `${BRIDGE_FOLDER}/${file.name}`,
        sourceTree: '"<group>"',
      };
      xcodeProject.hash.project.objects['PBXFileReference'][`${fileRefUuid}_comment`] = file.name;
      
      fileRefs.push({ value: fileRefUuid, comment: file.name });
      
      // Add build file
      xcodeProject.hash.project.objects['PBXBuildFile'][buildFileUuid] = {
        isa: 'PBXBuildFile',
        fileRef: fileRefUuid,
        fileRef_comment: file.name,
      };
      xcodeProject.hash.project.objects['PBXBuildFile'][`${buildFileUuid}_comment`] = `${file.name} in Sources`;
      
      buildFiles.push({ value: buildFileUuid, comment: `${file.name} in Sources` });
    }
    
    // Create a group for the bridge files
    const bridgeGroupUuid = xcodeProject.generateUuid();
    xcodeProject.hash.project.objects['PBXGroup'][bridgeGroupUuid] = {
      isa: 'PBXGroup',
      children: fileRefs,
      name: BRIDGE_FOLDER,
      sourceTree: '"<group>"',
    };
    xcodeProject.hash.project.objects['PBXGroup'][`${bridgeGroupUuid}_comment`] = BRIDGE_FOLDER;
    
    // Add group to main group
    const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;
    xcodeProject.hash.project.objects['PBXGroup'][mainGroup].children.push({
      value: bridgeGroupUuid,
      comment: BRIDGE_FOLDER,
    });
    
    // Find main target's Sources build phase and add files
    const mainTargetObj = xcodeProject.hash.project.objects['PBXNativeTarget'][mainTargetUuid];
    
    for (const phase of mainTargetObj.buildPhases) {
      const phaseUuid = typeof phase === 'object' ? phase.value : phase;
      const sourcesPhase = xcodeProject.hash.project.objects['PBXSourcesBuildPhase']?.[phaseUuid];
      if (sourcesPhase) {
        for (const buildFile of buildFiles) {
          sourcesPhase.files.push(buildFile);
        }
        break;
      }
    }

    console.log(`✅ Added ${BRIDGE_FOLDER} to Xcode project`);
    
    return config;
  });
}

module.exports = withWidgetBridge;
