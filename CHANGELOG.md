# Roadmap
This is a incomplete list of all the features I want to include into a specific version, before I bump to the next version. It basically serves me as a guide, to focus on specific features, as I otherwise tend to work on this codebase rather aimlessly. 

## v0.0.4
- Intelligent worker count management

## v0.0.5
- Logic to use containers at mining sites
- Implement transporters

## v0.0.6
- Transporters now check, if enough energy is left to refuel themselves, once they reach the mining container and otherwise choose another container
- Changed hardcoded storage level threshold to a constant in settings.ts
- Workers now don't clog around the storage, if storage is not full enough
- Transporters now choose to transport to upgradeContainer, if other transporters already are filling the storage to STORAGE_LEVEL_THRESHOLD
