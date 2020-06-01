(function(){
'use strict';

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.directive('foundItems', FoundItems)
.constant('baseURL', 'https://davids-restaurant.herokuapp.com/');

NarrowItDownController.$inject = ['MenuSearchService'];
function NarrowItDownController(MenuSearchService) {
    var myCtrl = this;
    myCtrl.foundResults = [];
    myCtrl.queryString = '';
    myCtrl.message = '';
    myCtrl.getFilteredResult = function(){
        var str = myCtrl.queryString.trim();
        if (str) {
            var promise = MenuSearchService.getMatchedMenuItems(str);

            promise.then(function (result) {
                myCtrl.foundResults = result;
                myCtrl.message = (myCtrl.foundResults.length) ?
                    '' : 'no match found for your query';
            })
            .catch(function (err) {
                myCtrl.message = 'fail to retrieve the items required';
            });
        } else {
            myCtrl.message = 'empty string, please type in a query first';
        }
    }
    myCtrl.removeItem = function(index){
        if (myCtrl.foundResults[index] != undefined) {
            var item = myCtrl.foundResults.splice(index, 1);
            return item;
        }
    }
}

MenuSearchService.$inject = ['$http', '$q','baseURL'];
function MenuSearchService($http, $q, baseURL) {
    var service = this;

    service.getItems = function(){
        var response = $http({
            method: 'GET',
            url: (baseURL + 'menu_items.json'),
        });
        return response;
    }

    service.checkMatch = function(str){ 
        var filtered = []; 
        for (var i = 0; i < service.menuItems.length; i++) {
            var item = service.menuItems[i];
            if (item.description.indexOf(str) != -1) {
                filtered.push(item);
            }
        }
        return filtered;
    }

    service.getMatchedMenuItems = function(str){
        var deferred = $q.defer();
        var promise = service.getItems();
        promise.then(function(response) {
            service.menuItems = response.data.menu_items;
            var matchedItems = service.checkMatch(str);
            deferred.resolve(matchedItems);
        })
        .catch(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
}

function FoundItems() {
    var ddo = {
        restrict: 'E',
        templateUrl: './foundItems.html',
        scope: {
            foundItems: '<',
            onRemove: '&',
        },
    };
    return ddo;
}

})();
