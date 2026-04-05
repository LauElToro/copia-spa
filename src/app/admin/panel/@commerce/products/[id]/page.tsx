import UploadProductPage from "@/presentation/admin/panel/commerce/pages/upload-product-page";

export default function EditProduct({params}: Readonly<{params: {id: string}}>) {
    return <UploadProductPage id={params.id} />
}