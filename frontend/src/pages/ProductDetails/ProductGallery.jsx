import Btn from "../../components/Common/Btn";

function ProductGallery({
  product,
  selectedImageIndex,
  setSelectedImageIndex,
  shareProduct,
  navigate,
}) {
  const images = product?.images || [];
  const mainImage = images[selectedImageIndex]?.url || "/placeholder.jpg";

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-linear-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl group">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-64 sm:h-80 md:h-96 object-contain bg-primarybg transition-transform duration-500 group-hover:scale-105"
        />
        {product.onSale && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-linear-to-r from-danger/75 to-danger text-primarybg px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-md md:shadow-lg">
            SALE
          </div>
        )}
        {product.featured && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-linear-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-md md:shadow-lg">
            <i className="fa-solid fa-star mr-1"></i>
            <span className="hidden sm:inline"> FEATURED</span>
            <span className="sm:hidden">F</span>
          </div>
        )}
        <button
          onClick={() => {
            const img = new Image();
            img.src = mainImage;
            const w = window.open("");
            w.document.write(img.outerHTML);
          }}
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-primarybg/90 hover:bg-primarybg text-secondary px-2 py-1 md:px-2.5 md:py-2 rounded-full shadow-md md:shadow-lg transition-all hover:scale-110 active:scale-95"
          title="View full size"
        >
          <i className="fa-solid fa-expand text-xs md:text-sm"></i>
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-secondary font-medium">
              {selectedImageIndex + 1} / {images.length}
            </p>
            <div className="flex gap-2">
              <Btn
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1
                  )
                }
                className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary whitespace-nowrap"
                title="Previous image"
              >
                <i className="fa-solid fa-chevron-left text-sm"></i>
              </Btn>
              <Btn
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0
                  )
                }
                className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary whitespace-nowrap"
                title="Next image"
              >
                <i className="fa-solid fa-chevron-right text-sm"></i>
              </Btn>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 px-1 -mx-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                  selectedImageIndex === idx
                    ? "border-primary shadow-md md:shadow-lg scale-105"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <img
                  src={img.url || img}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share & Actions */}
      <div className="flex flex-wrap gap-2 md:gap-3 pt-4">
        <Btn
          onClick={shareProduct}
          className="flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 bg-linear-to-r from-blue-50 to-blue-100 text-primary rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all flex-1 md:flex-initial text-sm md:text-base"
        >
          <i className="fa-solid fa-share-alt"></i>
          <span>Share</span>
        </Btn>
        <Btn
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 bg-linear-to-r from-gray-50 to-gray-100 text-secondary rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all flex-1 md:flex-initial text-sm md:text-base"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back</span>
        </Btn>
      </div>
    </div>
  );
}

export default ProductGallery;
