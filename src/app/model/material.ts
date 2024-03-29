export interface Material{
    id: string;
    name: string;
    nameKana: string;
    type: string;
    limitCount: number | string;
    imageUrl: string;
    status: string;
}

export interface MaterialWithImage extends Material { 
    imageSrc?: string;
}

export const MaterialStatus = {
    use: '取扱有',
    noUse: '廃止',
}

export function initMaterial(): Material {
	const result: Material= {
        id: '',
        name: '',
        nameKana: '',
        type: '',
        limitCount: null,
        imageUrl: '',
        status: MaterialStatus.use,
	}
	return result;
}