import React from 'react';
import { ProductsBlock } from '../../../types';

const ProductsBlockPreview: React.FC<ProductsBlock> = ({ title, products }) => {
    return (
        <section className="py-8 my-2">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Our Products'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border dark:border-gray-600">
                        <h3 className="font-semibold text-lg mb-2">{product.name || 'Product Name'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{product.description || 'Product description goes here.'}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProductsBlockPreview;
