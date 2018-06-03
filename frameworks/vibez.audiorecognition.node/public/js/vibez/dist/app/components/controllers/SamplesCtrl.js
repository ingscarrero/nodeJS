/// <reference path='../../../vibez.ts' />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_HOUR = 3600000;
const MILLISECONDS_PER_DAY = 86400000;
var vibez;
(function (vibez) {
    const REFRESH_FREQUENCY = 20000;
    angular.module('vibezApp').controller('SamplesController', SamplesController);
    SamplesController.$inject = ['SamplesProvider', '$location', '$sce', '$scope'];
    function SamplesController(SamplesProvider, $location, $sce, $scope) {
        let defaultData = [
            {
                artistsText: 'TEST',
                genresText: 'TEST',
                metadata: {
                    name: 'TEST'
                },
                sampleUri: 'https://firebasestorage.googleapis.com/v0/b/good-vibes-9edf1.appspot.com/o/fingerprints%2F1511461862731.aac?alt=media&token=e6b68f79-c112-442c-af49-cd5184bd9ab9'
            },
            {
                artistsText: 'TEST',
                genresText: 'TEST',
                metadata: {
                    name: 'TEST'
                },
                sampleUri: 'https://firebasestorage.googleapis.com/v0/b/good-vibes-9edf1.appspot.com/o/fingerprints%2F1511461862731.aac?alt=media&token=e6b68f79-c112-442c-af49-cd5184bd9ab9'
            },
            {
                artistsText: 'TEST',
                genresText: 'TEST',
                metadata: {
                    name: 'TEST'
                },
                sampleUri: 'https://firebasestorage.googleapis.com/v0/b/good-vibes-9edf1.appspot.com/o/fingerprints%2F1511461862731.aac?alt=media&token=e6b68f79-c112-442c-af49-cd5184bd9ab9'
            }
        ];
        var ctrl = this;
        ctrl.trustedUrl = trustedUrl;
        ctrl.isPlaying = false;
        ctrl.onPlayingComplete = onPlayingComplete;
        activate();
        function activate() {
            loadSamples();
            setInterval(() => {
                loadSamples();
            }, REFRESH_FREQUENCY);
        }
        function onPlayingComplete(index) {
            ctrl.isPlaying = !ctrl.isPlaying;
            if (!ctrl.isPlaying) {
                angular.element(document.getElementById(`sample_player_${index}`))[0].pause();
            }
            else {
                ctrl.playingSample = index;
                angular.element(document.getElementById(`sample_player_${index}`))[0].play();
            }
        }
        function onPlay() {
            setTimeout(() => {
                $scope.$apply(() => {
                    ctrl.isPlaying = true;
                });
            }, 1);
        }
        function trustedUrl(url) {
            return $sce.trustAsResourceUrl(url);
        }
        function loadSamples() {
            SamplesProvider.get()
                .then((result) => {
                let values = result.message.action.samples
                    .sort((a, b) => {
                    let aTime = new Date(a.createdAt).getTime();
                    let bTime = new Date(b.createdAt).getTime();
                    return bTime - aTime;
                })
                    .slice(0, 10)
                    .map((s, index) => __awaiter(this, void 0, void 0, function* () {
                    let sample = Object.assign({}, s);
                    sample.artistsText = sample.metadata.artists ? sample.metadata.artists
                        .map(a => a.name)
                        .join(', ') : '';
                    sample.genresText = sample.metadata.genres ? sample.metadata.genres
                        .map(g => g.name)
                        .join(', ') : '';
                    var options = {
                        hour: "2-digit", minute: "2-digit"
                    };
                    let now = new Date(Date.now());
                    let sampleTime = new Date(sample.createdAt);
                    let elapsedMilliseconds = now.getTime() - sampleTime.getTime();
                    let elapsedMinutes = Math.floor(elapsedMilliseconds / MILLISECONDS_PER_MINUTE);
                    let elapsedHours = Math.floor((elapsedMilliseconds / MILLISECONDS_PER_HOUR));
                    let elapsedDays = Math.floor((elapsedMilliseconds / MILLISECONDS_PER_DAY));
                    sample.elapsed = `${(elapsedDays ?
                        `${elapsedDays} days, ` : '') +
                        (elapsedHours ? `${elapsedHours % 24} hours, ` : '') +
                        `${elapsedMinutes % 60} minutes`} ago.`; //new Date(sample.createdAt).toLocaleDateString('en-us', options);
                    if (sample.metadata && sample.metadata.spotify) {
                        let { message } = yield SamplesProvider.detail(sample.metadata.spotify.trackId);
                        let { albumPhotoUrl } = message.action.trackInfo;
                        sample.albumCover = albumPhotoUrl;
                    }
                    sample.autoplay = index == 0;
                    return sample;
                }));
                return Promise.all(values);
            }).then(result => {
                ctrl.data = result;
                angular.element(document).ready(function () {
                    let players = document.getElementsByClassName('sample_player');
                    for (let index = 0; index < players.length; index++) {
                        let player = angular.element(players.item(index))[0];
                        player.onplaying = onPlay.bind(this, index);
                        player.onended = onPlayingComplete.bind(this, index);
                    }
                    ctrl.playingSample = 0;
                });
            })
                .catch(err => {
                console.warn(err);
            });
        }
    }
})(vibez || (vibez = {}));
//# sourceMappingURL=SamplesCtrl.js.map