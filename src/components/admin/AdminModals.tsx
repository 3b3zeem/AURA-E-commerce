"use client";

import React, { useEffect } from "react";
import { Product, Category, Brand, Story, Offer } from "@/types";
import { AddProductModal } from "./modals/AddProductModal";
import { EditProductModal } from "./modals/EditProductModal";
import { AddCategoryModal } from "./modals/AddCategoryModal";
import { EditCategoryModal } from "./modals/EditCategoryModal";
import { AddStoryModal } from "./modals/AddStoryModal";
import { EditStoryModal } from "./modals/EditStoryModal";
import { AddTrendingModal } from "./modals/AddTrendingModal";
import { AddOfferModal } from "./modals/AddOfferModal";
import { EditOfferModal } from "./modals/EditOfferModal";
export { DEFAULT_PRODUCT_BRANDS, PRODUCT_BADGE_OPTIONS, TARGET_GENDER_OPTIONS } from "./modals/modalConstants";

interface AdminModalsProps {
  categoriesList: Category[];
  brandsList?: Brand[];
  isSubmitting: boolean;
  onFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void,
  ) => void;

  // Add Product Modal
  isAddProductOpen: boolean;
  onCloseAddProduct: () => void;
  newProdName: string;
  setNewProdName: (v: string) => void;
  newProdDesc: string;
  setNewProdDesc: (v: string) => void;
  newProdPrice: string;
  setNewProdPrice: (v: string) => void;
  newProdOrigPrice: string;
  setNewProdOrigPrice: (v: string) => void;
  newProdStock: string;
  setNewProdStock: (v: string) => void;
  newProdBadge: string;
  setNewProdBadge: (v: string) => void;
  newProdCategory: string;
  setNewProdCategory: (v: string) => void;
  newProdImage: string;
  setNewProdImage: (v: string) => void;
  newProdImages?: string[];
  setNewProdImages?: (imgs: string[]) => void;
  newProdFeatured: boolean;
  setNewProdFeatured: (v: boolean) => void;
  newProdFlashDeal: boolean;
  setNewProdFlashDeal: (v: boolean) => void;

  newProdBrand?: string;
  setNewProdBrand?: (v: string) => void;
  newProdBoughtPastMonth?: string;
  setNewProdBoughtPastMonth?: (v: string) => void;
  newProdSku?: string;
  setNewProdSku?: (v: string) => void;
  newProdTargetGender?: string;
  setNewProdTargetGender?: (v: string) => void;
  newProdOriginCountry?: string;
  setNewProdOriginCountry?: (v: string) => void;
  newProdShelfLife?: string;
  setNewProdShelfLife?: (v: string) => void;
  newProdKeyBenefits?: string;
  setNewProdKeyBenefits?: (v: string) => void;
  newProdHighlights?: string;
  setNewProdHighlights?: (v: string) => void;
  newProdUsage?: string;
  setNewProdUsage?: (v: string) => void;
  newProdCare?: string;
  setNewProdCare?: (v: string) => void;
  newProdPackageIncludes?: string;
  setNewProdPackageIncludes?: (v: string) => void;
  newProdDeliveryInfo?: string;
  setNewProdDeliveryInfo?: (v: string) => void;
  newProdReturnPolicy?: string;
  setNewProdReturnPolicy?: (v: string) => void;
  newProdDiscountStartsAt?: string;
  setNewProdDiscountStartsAt?: (v: string) => void;
  newProdDiscountEndsAt?: string;
  setNewProdDiscountEndsAt?: (v: string) => void;
  newProdFlashStartsAt?: string;
  setNewProdFlashStartsAt?: (v: string) => void;
  newProdFlashEndsAt?: string;
  setNewProdFlashEndsAt?: (v: string) => void;

  onAddProductSubmit: (e: React.FormEvent) => void;

  // Add Category Modal
  isAddCategoryOpen: boolean;
  onCloseAddCategory: () => void;
  newCatName: string;
  setNewCatName: (v: string) => void;
  newCatSlug: string;
  setNewCatSlug: (v: string) => void;
  newCatDesc: string;
  setNewCatDesc: (v: string) => void;
  newCatImage: string;
  setNewCatImage: (v: string) => void;
  newCatFeatured: boolean;
  setNewCatFeatured: (v: boolean) => void;
  onAddCategorySubmit: (e: React.FormEvent) => void;

  // Add Story Modal
  isAddStoryOpen: boolean;
  onCloseAddStory: () => void;
  newStoryTitle: string;
  setNewStoryTitle: (v: string) => void;
  newStorySub: string;
  setNewStorySub: (v: string) => void;
  newStoryImg: string;
  setNewStoryImg: (v: string) => void;
  newStoryBgGradient?: string;
  setNewStoryBgGradient?: (v: string) => void;
  newStoryIsActive?: boolean;
  setNewStoryIsActive?: (v: boolean) => void;
  newStorySelectedProductIds?: string[];
  setNewStorySelectedProductIds?: (ids: string[]) => void;
  onAddStorySubmit: (e: React.FormEvent) => void;

  // Add Trending Modal
  isAddTrendingOpen: boolean;
  onCloseAddTrending: () => void;
  newTrendingQuery: string;
  setNewTrendingQuery: (v: string) => void;
  onAddTrendingSubmit: (e: React.FormEvent) => void;

  // Edit Product Modal
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  onUpdateProductSubmit: (e: React.FormEvent) => void;

  // Edit Category Modal
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  onUpdateCategorySubmit: (e: React.FormEvent) => void;

  // Edit Story Modal
  editingStory: Story | null;
  setEditingStory: (s: Story | null) => void;
  editStorySelectedProductIds?: string[];
  setEditStorySelectedProductIds?: (ids: string[]) => void;
  onUpdateStorySubmit: (e: React.FormEvent) => void;

  // Add / Edit Offer Modal Props
  productsList?: Product[];
  isAddOfferOpen?: boolean;
  onCloseAddOffer?: () => void;
  newOfferTitle?: string;
  setNewOfferTitle?: (v: string) => void;
  newOfferSub?: string;
  setNewOfferSub?: (v: string) => void;
  newOfferDesc?: string;
  setNewOfferDesc?: (v: string) => void;
  newOfferBadge?: string;
  setNewOfferBadge?: (v: string) => void;
  newOfferImage?: string;
  setNewOfferImage?: (v: string) => void;
  newOfferOrigPrice?: string;
  setNewOfferOrigPrice?: (v: string) => void;
  newOfferPrice?: string;
  setNewOfferPrice?: (v: string) => void;
  newOfferSelectedProductIds?: string[];
  setNewOfferSelectedProductIds?: (ids: string[]) => void;
  newOfferOverlay?: boolean;
  setNewOfferOverlay?: (v: boolean) => void;
  newOfferStartsAt?: string;
  setNewOfferStartsAt?: (v: string) => void;
  newOfferEndsAt?: string;
  setNewOfferEndsAt?: (v: string) => void;
  onAddOfferSubmit?: (e: React.FormEvent) => void;

  editingOffer?: Offer | null;
  setEditingOffer?: (o: Offer | null) => void;
  onUpdateOfferSubmit?: (e: React.FormEvent) => void;
}

export function AdminModals({
  categoriesList,
  brandsList,
  isSubmitting,
  onFileUpload,

  isAddProductOpen,
  onCloseAddProduct,
  newProdName,
  setNewProdName,
  newProdDesc,
  setNewProdDesc,
  newProdPrice,
  setNewProdPrice,
  newProdOrigPrice,
  setNewProdOrigPrice,
  newProdStock,
  setNewProdStock,
  newProdBadge,
  setNewProdBadge,
  newProdCategory,
  setNewProdCategory,
  newProdImage,
  setNewProdImage,
  newProdImages = [newProdImage],
  setNewProdImages,
  newProdFeatured,
  setNewProdFeatured,
  newProdFlashDeal,
  setNewProdFlashDeal,
  newProdBrand,
  setNewProdBrand,
  newProdBoughtPastMonth,
  setNewProdBoughtPastMonth,
  newProdSku,
  setNewProdSku,
  newProdTargetGender,
  setNewProdTargetGender,
  newProdOriginCountry,
  setNewProdOriginCountry,
  newProdShelfLife,
  setNewProdShelfLife,
  newProdKeyBenefits,
  setNewProdKeyBenefits,
  newProdHighlights,
  setNewProdHighlights,
  newProdUsage,
  setNewProdUsage,
  newProdCare,
  setNewProdCare,
  newProdPackageIncludes,
  setNewProdPackageIncludes,
  newProdDeliveryInfo,
  setNewProdDeliveryInfo,
  newProdReturnPolicy,
  setNewProdReturnPolicy,
  newProdDiscountStartsAt = "",
  setNewProdDiscountStartsAt,
  newProdDiscountEndsAt = "",
  setNewProdDiscountEndsAt,
  newProdFlashStartsAt = "",
  setNewProdFlashStartsAt,
  newProdFlashEndsAt = "",
  setNewProdFlashEndsAt,
  onAddProductSubmit,

  isAddCategoryOpen,
  onCloseAddCategory,
  newCatName,
  setNewCatName,
  newCatSlug,
  setNewCatSlug,
  newCatDesc,
  setNewCatDesc,
  newCatImage,
  setNewCatImage,
  newCatFeatured,
  setNewCatFeatured,
  onAddCategorySubmit,

  isAddStoryOpen,
  onCloseAddStory,
  newStoryTitle,
  setNewStoryTitle,
  newStorySub,
  setNewStorySub,
  newStoryImg,
  setNewStoryImg,
  newStoryBgGradient,
  setNewStoryBgGradient,
  newStoryIsActive = true,
  setNewStoryIsActive,
  newStorySelectedProductIds = [],
  setNewStorySelectedProductIds,
  onAddStorySubmit,

  isAddTrendingOpen,
  onCloseAddTrending,
  newTrendingQuery,
  setNewTrendingQuery,
  onAddTrendingSubmit,

  editingProduct,
  setEditingProduct,
  onUpdateProductSubmit,

  editingCategory,
  setEditingCategory,
  onUpdateCategorySubmit,

  editingStory,
  setEditingStory,
  editStorySelectedProductIds = [],
  setEditStorySelectedProductIds,
  onUpdateStorySubmit,

  productsList = [],
  isAddOfferOpen = false,
  onCloseAddOffer,
  newOfferTitle = "",
  setNewOfferTitle,
  newOfferSub = "",
  setNewOfferSub,
  newOfferDesc = "",
  setNewOfferDesc,
  newOfferBadge = "SPECIAL BUNDLE",
  setNewOfferBadge,
  newOfferImage = "",
  setNewOfferImage,
  newOfferOrigPrice = "",
  setNewOfferOrigPrice,
  newOfferPrice = "",
  setNewOfferPrice,
  newOfferSelectedProductIds = [],
  setNewOfferSelectedProductIds,
  newOfferOverlay = false,
  setNewOfferOverlay,
  newOfferStartsAt = "",
  setNewOfferStartsAt,
  newOfferEndsAt = "",
  setNewOfferEndsAt,
  onAddOfferSubmit,

  editingOffer = null,
  setEditingOffer,
  onUpdateOfferSubmit,
}: AdminModalsProps) {
  const isAnyModalOpen = Boolean(
    isAddProductOpen ||
      editingProduct ||
      isAddCategoryOpen ||
      editingCategory ||
      isAddStoryOpen ||
      editingStory ||
      isAddOfferOpen ||
      editingOffer ||
      isAddTrendingOpen,
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  return (
    <>
      {/* MODAL 1: ADD PRODUCT */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={onCloseAddProduct}
        isSubmitting={isSubmitting}
        categoriesList={categoriesList}
        brandsList={brandsList}
        onFileUpload={onFileUpload}
        newProdName={newProdName}
        setNewProdName={setNewProdName}
        newProdDesc={newProdDesc}
        setNewProdDesc={setNewProdDesc}
        newProdPrice={newProdPrice}
        setNewProdPrice={setNewProdPrice}
        newProdOrigPrice={newProdOrigPrice}
        setNewProdOrigPrice={setNewProdOrigPrice}
        newProdStock={newProdStock}
        setNewProdStock={setNewProdStock}
        newProdBadge={newProdBadge}
        setNewProdBadge={setNewProdBadge}
        newProdCategory={newProdCategory}
        setNewProdCategory={setNewProdCategory}
        newProdImage={newProdImage}
        setNewProdImage={setNewProdImage}
        newProdImages={newProdImages}
        setNewProdImages={setNewProdImages}
        newProdFeatured={newProdFeatured}
        setNewProdFeatured={setNewProdFeatured}
        newProdFlashDeal={newProdFlashDeal}
        setNewProdFlashDeal={setNewProdFlashDeal}
        newProdBrand={newProdBrand}
        setNewProdBrand={setNewProdBrand}
        newProdBoughtPastMonth={newProdBoughtPastMonth}
        setNewProdBoughtPastMonth={setNewProdBoughtPastMonth}
        newProdSku={newProdSku}
        setNewProdSku={setNewProdSku}
        newProdTargetGender={newProdTargetGender}
        setNewProdTargetGender={setNewProdTargetGender}
        newProdOriginCountry={newProdOriginCountry}
        setNewProdOriginCountry={setNewProdOriginCountry}
        newProdShelfLife={newProdShelfLife}
        setNewProdShelfLife={setNewProdShelfLife}
        newProdKeyBenefits={newProdKeyBenefits}
        setNewProdKeyBenefits={setNewProdKeyBenefits}
        newProdHighlights={newProdHighlights}
        setNewProdHighlights={setNewProdHighlights}
        newProdUsage={newProdUsage}
        setNewProdUsage={setNewProdUsage}
        newProdCare={newProdCare}
        setNewProdCare={setNewProdCare}
        newProdPackageIncludes={newProdPackageIncludes}
        setNewProdPackageIncludes={setNewProdPackageIncludes}
        newProdDeliveryInfo={newProdDeliveryInfo}
        setNewProdDeliveryInfo={setNewProdDeliveryInfo}
        newProdReturnPolicy={newProdReturnPolicy}
        setNewProdReturnPolicy={setNewProdReturnPolicy}
        newProdDiscountStartsAt={newProdDiscountStartsAt}
        setNewProdDiscountStartsAt={setNewProdDiscountStartsAt}
        newProdDiscountEndsAt={newProdDiscountEndsAt}
        setNewProdDiscountEndsAt={setNewProdDiscountEndsAt}
        newProdFlashStartsAt={newProdFlashStartsAt}
        setNewProdFlashStartsAt={setNewProdFlashStartsAt}
        newProdFlashEndsAt={newProdFlashEndsAt}
        setNewProdFlashEndsAt={setNewProdFlashEndsAt}
        onSubmit={onAddProductSubmit}
      />

      {/* MODAL 2: ADD CATEGORY */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={onCloseAddCategory}
        isSubmitting={isSubmitting}
        onFileUpload={onFileUpload}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        newCatSlug={newCatSlug}
        setNewCatSlug={setNewCatSlug}
        newCatDesc={newCatDesc}
        setNewCatDesc={setNewCatDesc}
        newCatImage={newCatImage}
        setNewCatImage={setNewCatImage}
        newCatFeatured={newCatFeatured}
        setNewCatFeatured={setNewCatFeatured}
        onSubmit={onAddCategorySubmit}
      />

      {/* MODAL 3: ADD STORY */}
      <AddStoryModal
        isOpen={isAddStoryOpen}
        onClose={onCloseAddStory}
        isSubmitting={isSubmitting}
        onFileUpload={onFileUpload}
        newStoryTitle={newStoryTitle}
        setNewStoryTitle={setNewStoryTitle}
        newStorySub={newStorySub}
        setNewStorySub={setNewStorySub}
        newStoryImg={newStoryImg}
        setNewStoryImg={setNewStoryImg}
        newStoryBgGradient={newStoryBgGradient}
        setNewStoryBgGradient={setNewStoryBgGradient}
        newStoryIsActive={newStoryIsActive}
        setNewStoryIsActive={setNewStoryIsActive}
        productsList={productsList}
        categoriesList={categoriesList}
        selectedProductIds={newStorySelectedProductIds}
        setSelectedProductIds={setNewStorySelectedProductIds}
        onSubmit={onAddStorySubmit}
      />

      {/* MODAL 4: ADD TRENDING KEYWORD */}
      <AddTrendingModal
        isOpen={isAddTrendingOpen}
        onClose={onCloseAddTrending}
        isSubmitting={isSubmitting}
        newTrendingQuery={newTrendingQuery}
        setNewTrendingQuery={setNewTrendingQuery}
        onSubmit={onAddTrendingSubmit}
      />

      {/* EDIT MODAL 1: EDIT PRODUCT */}
      <EditProductModal
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        isSubmitting={isSubmitting}
        categoriesList={categoriesList}
        brandsList={brandsList}
        onFileUpload={onFileUpload}
        onSubmit={onUpdateProductSubmit}
      />

      {/* EDIT MODAL 2: EDIT CATEGORY */}
      <EditCategoryModal
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        isSubmitting={isSubmitting}
        onFileUpload={onFileUpload}
        onSubmit={onUpdateCategorySubmit}
      />

      {/* EDIT MODAL 3: EDIT STORY */}
      <EditStoryModal
        editingStory={editingStory}
        setEditingStory={setEditingStory}
        isSubmitting={isSubmitting}
        onFileUpload={onFileUpload}
        productsList={productsList}
        categoriesList={categoriesList}
        selectedProductIds={editStorySelectedProductIds}
        setSelectedProductIds={setEditStorySelectedProductIds}
        onSubmit={onUpdateStorySubmit}
      />

      {/* MODAL: ADD OFFER BUNDLE */}
      <AddOfferModal
        isOpen={isAddOfferOpen}
        onClose={onCloseAddOffer}
        isSubmitting={isSubmitting}
        onFileUpload={onFileUpload}
        productsList={productsList}
        categoriesList={categoriesList}
        newOfferTitle={newOfferTitle}
        setNewOfferTitle={setNewOfferTitle}
        newOfferBadge={newOfferBadge}
        setNewOfferBadge={setNewOfferBadge}
        newOfferSub={newOfferSub}
        setNewOfferSub={setNewOfferSub}
        newOfferSelectedProductIds={newOfferSelectedProductIds}
        setNewOfferSelectedProductIds={setNewOfferSelectedProductIds}
        newOfferOrigPrice={newOfferOrigPrice}
        setNewOfferOrigPrice={setNewOfferOrigPrice}
        newOfferPrice={newOfferPrice}
        setNewOfferPrice={setNewOfferPrice}
        newOfferImage={newOfferImage}
        setNewOfferImage={setNewOfferImage}
        newOfferDesc={newOfferDesc}
        setNewOfferDesc={setNewOfferDesc}
        newOfferStartsAt={newOfferStartsAt}
        setNewOfferStartsAt={setNewOfferStartsAt}
        newOfferEndsAt={newOfferEndsAt}
        setNewOfferEndsAt={setNewOfferEndsAt}
        newOfferOverlay={newOfferOverlay}
        setNewOfferOverlay={setNewOfferOverlay}
        onSubmit={onAddOfferSubmit || ((e) => e.preventDefault())}
      />

      {/* MODAL: EDIT OFFER BUNDLE */}
      <EditOfferModal
        editingOffer={editingOffer}
        setEditingOffer={setEditingOffer}
        isSubmitting={isSubmitting}
        productsList={productsList}
        categoriesList={categoriesList}
        onSubmit={onUpdateOfferSubmit || ((e) => e.preventDefault())}
      />
    </>
  );
}
