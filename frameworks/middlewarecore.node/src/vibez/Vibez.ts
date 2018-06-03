// import {
//   ApplicationContext,
//   ApplicationManagerLog,
//   ApplicationManager,
//   VERSION_FORMAT,
//   User,
//   UserKind
// } from "./modules/security";
// import {
//   Indexable,
//   IndexableCollection,
//   PlatformError,
//   UIError,
//   VibezError
// } from "./modules/common";

// const { APP_SETTINGS } = process.env;

// export async function init() {
//   let result = perform(() => {
//     return ApplicationManager.init();
//   });
//   return result;
// }

// export async function authenticateComponent(
//   name: string
// ): Promise<User<"COMPONENT">> {
//   try {
//     const { appID, appKey, appVersion } = JSON.parse(APP_SETTINGS!);

//     let appVersionMatches = appVersion.match(VERSION_FORMAT);
//     if (!appVersionMatches) {
//       return Promise.reject(
//         new PlatformError(
//           "INVALID_VERSION",
//           "This component has no valid version",
//           name,
//           `When authenticating component ${name}, it wasn't possible to determine corresponding component versioning`,
//           undefined,
//           "MEDIUM",
//           "Component's appVersion setting has invalid or missing Version Information. Please validate the Environment Setup and try again."
//         )
//       );
//     }
//     let [major, minor, patch] = [
//       ...appVersionMatches.slice(1).map((item: string) => parseInt(item))
//     ];

//     let appAccount = await ApplicationManager.authenticateApp(appID, appKey, {
//       major,
//       minor,
//       patch
//     });

//     return appAccount;
//   } catch (err) {
//     return Promise.reject(
//       new PlatformError(
//         "INVALID_COMPONENT",
//         "This component couldn't be validated",
//         name,
//         `When authenticating component ${name}, there was a problem. ${
//           err.message
//         }`,
//         err.stack,
//         "MEDIUM",
//         "Please validate the Environment Setup and try again."
//       )
//     );
//   }
// }
// export async function activateComponentFor(
//   componentName: string,
//   contact: Indexable
// ): Promise<boolean> {
//   let result = perform(async () => {
//     const { appID, appKey, appVersion } = JSON.parse(APP_SETTINGS!);
//     const appLog = new ApplicationManagerLog();

//     const appAddress = process.pid.toString();
//     const applicationContext = new ApplicationContext(
//       appID,
//       appKey,
//       appAddress,
//       appVersion,
//       appLog
//     );

//     let { id } = await ApplicationManager.getComponentIndexByName(
//       componentName
//     );

//     let component = { id } as IndexableCollection<"Components">;

//     // let appManager = new ApplicationManager(applicationContext);
//     // let result = await appManager.createApplicationAccount(component, contact);

//     return true;
//   });

//   return result;
// }

// async function perform<Result>(task: () => Promise<Result>): Promise<Result> {
//   try {
//     let result = await task();
//     return result;
//   } catch (error) {
//     let uhError = error as VibezError;
//     let hError = new UIError(
//       uhError.name,
//       "We're sorry! We couldn't process you request at this time.",
//       "Vibez Core",
//       "Please validate your information and try again. If the problem persist, reach us out at support@vibez.io with your contact information and the description of the issue. We will get in touch with you ASAP. Thanks for your understanding.",
//       undefined,
//       "LOW",
//       uhError.message,
//       `http://vibez.io/support/errors/${uhError.id}`
//     );
//     return Promise.reject(hError);
//   }
// }
