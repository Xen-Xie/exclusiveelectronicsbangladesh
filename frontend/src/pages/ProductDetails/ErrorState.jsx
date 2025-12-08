import Btn from "../../components/Common/Btn";

function ErrorState({ error, navigate }) {
  return (
    <div className="max-w-7xl mx-auto p-6 text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-red-100 to-red-200 rounded-full mb-6">
        <i className="fa-solid fa-exclamation-triangle text-3xl text-danger"></i>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        {error || "Product Not Found"}
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The product you're looking for doesn't exist or has been removed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Btn
          variant="primary"
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl"
        >
          <i className="fa-solid fa-home mr-2"></i>
          Back to Home
        </Btn>
        <Btn
          variant="outline"
          onClick={() => navigate("/products")}
          className="px-6 py-3 rounded-xl"
        >
          <i className="fa-solid fa-store mr-2"></i>
          Browse Products
        </Btn>
      </div>
    </div>
  );
}

export default ErrorState;
