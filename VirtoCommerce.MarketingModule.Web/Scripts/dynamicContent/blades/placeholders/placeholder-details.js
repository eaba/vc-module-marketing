﻿angular.module('virtoCommerce.marketingModule')
.controller('virtoCommerce.marketingModule.addPlaceholderController', ['$scope', 'virtoCommerce.marketingModule.dynamicContent.contentPlaces', 'platformWebApp.bladeNavigationService', 'FileUploader', 'platformWebApp.dialogService', function ($scope, marketing_dynamicContents_res_contentPlaces, bladeNavigationService, FileUploader, dialogService) {
    $scope.setForm = function (form) { $scope.formScope = form; }

    var blade = $scope.blade;
    blade.updatePermission = 'marketing:update';
    blade.originalEntity = angular.copy(blade.entity);

    blade.initialize = function () {
        if (!$scope.uploader && blade.hasUpdatePermission()) {
            // create the uploader
            var uploader = $scope.uploader = new FileUploader({
                scope: $scope,
                headers: { Accept: 'application/json' },
                url: 'api/platform/assets?folderUrl=placeholders-images',
                autoUpload: true,
                removeAfterUpload: true
            });

            uploader.onSuccessItem = function (fileItem, images, status, headers) {
                blade.entity.imageUrl = images[0].url;
            };

            uploader.onAfterAddingAll = function (addedItems) {
                bladeNavigationService.setError(null, blade);
            };

            uploader.onErrorItem = function (item, response, status, headers) {
                bladeNavigationService.setError(item._file.name + ' failed: ' + (response.message ? response.message : status), blade);
            };
        }

        if (!blade.isNew) {
            $scope.blade.toolbarCommands = [
				{
				    name: "platform.commands.save", icon: 'fa fa-save',
				    executeMethod: blade.saveChanges,
				    canExecuteMethod: function () {
				        return !angular.equals(blade.originalEntity, blade.entity) && !$scope.formScope.$invalid;
				    },
				    permission: blade.updatePermission
				},
                {
                    name: "platform.commands.reset", icon: 'fa fa-undo',
                    executeMethod: function () {
                        blade.entity = angular.copy(blade.originalEntity);
                    },
                    canExecuteMethod: function () {
                        return !angular.equals(blade.originalEntity, blade.entity);
                    },
                    permission: blade.updatePermission
                },
				{
				    name: "platform.commands.delete", icon: 'fa fa-trash-o',
				    executeMethod: function () {
				        var dialog = {
				            id: "confirmDeleteContentPlaceholder",
				            title: "marketing.dialogs.content-placeholder-delete.title",
				            message: "marketing.dialogs.content-placeholder-delete.message",
				            callback: function (remove) {
				                if (remove) {
				                    blade.delete();
				                }
				            }
				        };

				        dialogService.showConfirmationDialog(dialog);
				    },
				    canExecuteMethod: function () { return true; },
				    permission: blade.updatePermission
				}
            ];
        }

        blade.isLoading = false;
    }

    blade.delete = function () {
        blade.isLoading = true;
        marketing_dynamicContents_res_contentPlaces.delete({ ids: [blade.entity.id] }, function () {
            blade.parentBlade.initialize();
            bladeNavigationService.closeBlade(blade);
        });
    }

    blade.saveChanges = function () {
        blade.isLoading = true;

        if (blade.isNew) {
            marketing_dynamicContents_res_contentPlaces.save({}, blade.entity, function (data) {
                blade.parentBlade.initialize();
                bladeNavigationService.closeBlade(blade);
            });
        }
        else {
            marketing_dynamicContents_res_contentPlaces.update({}, blade.entity, function (data) {
                blade.parentBlade.initialize();
                blade.originalEntity = angular.copy(blade.entity);
                blade.isLoading = false;
            });
        }
    }

    $scope.blade.headIcon = 'fa-location-arrow';

    blade.initialize();
}]);