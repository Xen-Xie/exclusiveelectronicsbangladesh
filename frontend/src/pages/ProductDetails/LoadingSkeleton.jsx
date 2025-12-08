function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="bg-linear-to-br from-gray-200 to-gray-300 h-96 rounded-2xl"></div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-20 w-20 rounded-xl"></div>
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="bg-gray-200 h-10 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-6 rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 rounded w-full"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-200 h-12 rounded-lg w-32"></div>
            <div className="bg-gray-200 h-12 rounded-lg w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
