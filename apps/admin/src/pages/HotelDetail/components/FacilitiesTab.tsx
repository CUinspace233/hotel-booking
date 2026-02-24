import { useState } from 'react';
import { Button, Space, Tag, Modal, Select, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  FACILITY_CATEGORIES,
  FACILITY_OPTIONS_BY_CATEGORY,
  isPresetCategory,
  getCategoryLabel
} from '@/constants';
import type { FrontendFacilityDetail, FacilityCategory } from '@/types';

interface FacilitiesTabProps {
  facilities: FrontendFacilityDetail[];
  isViewMode: boolean;
  saving: boolean;
  onFacilitiesChange: (facilities: FrontendFacilityDetail[]) => void;
  onSave: () => void;
}

const FacilitiesTab: React.FC<FacilitiesTabProps> = ({
  facilities,
  isViewMode,
  saving,
  onFacilitiesChange,
  onSave
}) => {
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('');

  const [addFacilityModalVisible, setAddFacilityModalVisible] = useState(false);
  const [addFacilityCategory, setAddFacilityCategory] = useState<string>('');
  const [selectedPresetFacility, setSelectedPresetFacility] = useState<string>('');
  const [customFacilityName, setCustomFacilityName] = useState('');
  const [customFacilityDesc, setCustomFacilityDesc] = useState('');

  const getSelectedCategories = (): string[] => {
    const categories = facilities.map((f) => f.category);
    return [...new Set(categories)];
  };

  const handleOpenAddCategory = () => {
    setSelectedPresetCategory('');
    setCustomCategoryName('');
    setAddCategoryModalVisible(true);
  };

  const handleConfirmAddCategory = () => {
    let categoryValue = selectedPresetCategory;
    if (selectedPresetCategory === 'custom') {
      if (!customCategoryName.trim()) {
        message.warning('请输入自定义分类名称');
        return;
      }
      categoryValue = customCategoryName.trim();
    }
    if (!categoryValue) {
      message.warning('请选择或输入分类');
      return;
    }
    const existingCategories = getSelectedCategories();
    if (existingCategories.includes(categoryValue)) {
      message.warning('该分类已存在');
      return;
    }
    setAddCategoryModalVisible(false);
    setAddFacilityCategory(categoryValue);
    setAddFacilityModalVisible(true);
  };

  const handleDeleteCategory = (category: string) => {
    onFacilitiesChange(facilities.filter((f) => f.category !== category));
  };

  const handleOpenAddFacility = (category: string) => {
    setAddFacilityCategory(category);
    setSelectedPresetFacility('');
    setCustomFacilityName('');
    setCustomFacilityDesc('');
    setAddFacilityModalVisible(true);
  };

  const handleConfirmAddFacility = () => {
    let facilityCode = selectedPresetFacility;
    let facilityName = '';

    if (selectedPresetFacility === 'custom' || !isPresetCategory(addFacilityCategory)) {
      if (!customFacilityName.trim()) {
        message.warning('请输入设施名称');
        return;
      }
      facilityCode = `custom_${Date.now()}`;
      facilityName = customFacilityName.trim();
    } else {
      if (!selectedPresetFacility) {
        message.warning('请选择设施');
        return;
      }
      const options = FACILITY_OPTIONS_BY_CATEGORY[addFacilityCategory as FacilityCategory];
      const option = options?.find((o) => o.value === selectedPresetFacility);
      facilityName = option?.label || selectedPresetFacility;
    }

    const newFacility: FrontendFacilityDetail = {
      id: `new_${Date.now()}_${Math.random()}`,
      category: addFacilityCategory,
      facilityCode,
      facilityName,
      description: customFacilityDesc.trim() || undefined
    };
    onFacilitiesChange([...facilities, newFacility]);
    setAddFacilityModalVisible(false);
  };

  const handleDeleteFacility = (id: string) => {
    onFacilitiesChange(facilities.filter((f) => f.id !== id));
  };

  const selectedCategories = getSelectedCategories();

  return (
    <div>
      {/* 已添加的分类标签 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, color: '#666', fontWeight: 500 }}>已添加分类：</div>
        <Space wrap size={[8, 8]}>
          {selectedCategories.map((cat) => (
            <Tag
              key={cat}
              color="blue"
              closable={!isViewMode}
              onClose={() => handleDeleteCategory(cat)}
              style={{ padding: '4px 8px', fontSize: 14 }}
            >
              {getCategoryLabel(cat)}
            </Tag>
          ))}
          {!isViewMode && (
            <Tag
              onClick={handleOpenAddCategory}
              style={{
                padding: '4px 8px',
                fontSize: 14,
                cursor: 'pointer',
                borderStyle: 'dashed'
              }}
            >
              <PlusOutlined /> 添加分类
            </Tag>
          )}
        </Space>
      </div>

      {/* 按分类展示设施 */}
      {selectedCategories.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
          暂无设施，请点击"添加分类"按钮开始添加
        </div>
      ) : (
        selectedCategories.map((cat) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontWeight: 500,
                marginBottom: 12,
                color: '#333',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>▼ {getCategoryLabel(cat)}</span>
            </div>
            <Space wrap size={[8, 8]}>
              {facilities
                .filter((f) => f.category === cat)
                .map((facility) => (
                  <Tag
                    key={facility.id}
                    color="green"
                    closable={!isViewMode}
                    onClose={() => handleDeleteFacility(facility.id)}
                    style={{ padding: '4px 8px', fontSize: 14 }}
                  >
                    {facility.facilityName}
                    {facility.description && (
                      <span style={{ color: '#999', marginLeft: 4 }}>({facility.description})</span>
                    )}
                  </Tag>
                ))}
              {!isViewMode && (
                <Tag
                  onClick={() => handleOpenAddFacility(cat)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 14,
                    cursor: 'pointer',
                    borderStyle: 'dashed'
                  }}
                >
                  <PlusOutlined /> 添加设施
                </Tag>
              )}
            </Space>
          </div>
        ))
      )}

      {/* 保存按钮 */}
      {!isViewMode && facilities.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button type="primary" loading={saving} onClick={onSave}>
            保存设施
          </Button>
        </div>
      )}

      {/* 添加分类弹窗 */}
      <Modal
        title="添加设施分类"
        open={addCategoryModalVisible}
        onOk={handleConfirmAddCategory}
        onCancel={() => setAddCategoryModalVisible(false)}
        okText="下一步"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>选择预设分类：</div>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择分类"
            value={selectedPresetCategory}
            onChange={(v) => {
              setSelectedPresetCategory(v);
              if (v !== 'custom') setCustomCategoryName('');
            }}
            options={[
              ...FACILITY_CATEGORIES.filter((c) => !selectedCategories.includes(c.value)).map(
                (c) => ({ value: c.value, label: c.label })
              ),
              { value: 'custom', label: '其它设施（自定义）' }
            ]}
          />
        </div>
        {selectedPresetCategory === 'custom' && (
          <div>
            <div style={{ marginBottom: 8 }}>自定义分类名称：</div>
            <Input
              placeholder="请输入自定义分类名称"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* 添加设施弹窗 */}
      <Modal
        title={`添加${getCategoryLabel(addFacilityCategory)}设施`}
        open={addFacilityModalVisible}
        onOk={handleConfirmAddFacility}
        onCancel={() => setAddFacilityModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        {isPresetCategory(addFacilityCategory) ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>选择设施：</div>
              <Select
                style={{ width: '100%' }}
                placeholder="请选择设施"
                value={selectedPresetFacility}
                onChange={(v) => {
                  setSelectedPresetFacility(v);
                  if (v !== 'custom') setCustomFacilityName('');
                }}
                options={[
                  ...(FACILITY_OPTIONS_BY_CATEGORY[addFacilityCategory as FacilityCategory] || [])
                    .filter(
                      (o) =>
                        !facilities.some(
                          (f) => f.category === addFacilityCategory && f.facilityCode === o.value
                        )
                    )
                    .map((o) => ({ value: o.value, label: o.label })),
                  { value: 'custom', label: '自定义设施' }
                ]}
              />
            </div>
            {selectedPresetFacility === 'custom' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>设施名称：</div>
                <Input
                  placeholder="请输入设施名称"
                  value={customFacilityName}
                  onChange={(e) => setCustomFacilityName(e.target.value)}
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>设施名称：</div>
            <Input
              placeholder="请输入设施名称"
              value={customFacilityName}
              onChange={(e) => setCustomFacilityName(e.target.value)}
            />
          </div>
        )}
        <div>
          <div style={{ marginBottom: 8 }}>设施描述（可选）：</div>
          <Input.TextArea
            placeholder="如营业时间、位置说明等"
            value={customFacilityDesc}
            onChange={(e) => setCustomFacilityDesc(e.target.value)}
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
};

export default FacilitiesTab;
