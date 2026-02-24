import { Card, Button, Row, Col, Select, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { POLICY_TYPE_OPTIONS, getPolicyNameByType } from '@/constants';
import type { FrontendPolicyDetail, PolicyType } from '@/types';

interface PoliciesTabProps {
  policies: FrontendPolicyDetail[];
  isViewMode: boolean;
  saving: boolean;
  onPoliciesChange: (policies: FrontendPolicyDetail[]) => void;
  onSave: () => void;
}

const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies,
  isViewMode,
  saving,
  onPoliciesChange,
  onSave
}) => {
  const handleAddPolicy = () => {
    const newPolicy: FrontendPolicyDetail = {
      id: `new_${Date.now()}`,
      policyType: 'checkIn',
      policyName: '入住时间',
      policyContent: ''
    };
    onPoliciesChange([...policies, newPolicy]);
  };

  const handleRemovePolicy = (policyId: string) => {
    onPoliciesChange(policies.filter((policy) => policy.id !== policyId));
  };

  const handlePolicyChange = (
    policyId: string,
    field: keyof FrontendPolicyDetail,
    value: string
  ) => {
    onPoliciesChange(
      policies.map((policy) => {
        if (policy.id !== policyId) return policy;

        if (field === 'policyType') {
          const newType = value as PolicyType;
          return {
            ...policy,
            policyType: newType,
            policyName: newType === 'other' ? '' : getPolicyNameByType(newType)
          };
        }

        return { ...policy, [field]: value };
      })
    );
  };

  return (
    <div>
      {/* 添加政策按钮 */}
      {!isViewMode && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="dashed"
            onClick={handleAddPolicy}
            style={{ width: '100%' }}
            icon={<PlusOutlined />}
          >
            添加政策
          </Button>
        </div>
      )}

      {/* 政策详情卡片列表 */}
      {policies.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
          暂无政策，请点击"添加政策"按钮添加
        </div>
      ) : (
        policies.map((policy) => (
          <Card
            key={policy.id}
            size="small"
            style={{ marginBottom: 12 }}
            title="政策详情"
            extra={
              !isViewMode && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemovePolicy(policy.id)}
                >
                  删除
                </Button>
              )
            }
          >
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 8, color: '#666' }}>政策类型</div>
                <Select
                  style={{ width: '100%' }}
                  value={policy.policyType}
                  disabled={isViewMode}
                  onChange={(value) => handlePolicyChange(policy.id, 'policyType', value)}
                  options={POLICY_TYPE_OPTIONS}
                />
              </Col>
              <Col span={16}>
                <div style={{ marginBottom: 8, color: '#666' }}>政策名称</div>
                {policy.policyType === 'other' ? (
                  <Input
                    placeholder="请输入自定义政策名称"
                    value={policy.policyName}
                    disabled={isViewMode}
                    onChange={(e) => handlePolicyChange(policy.id, 'policyName', e.target.value)}
                  />
                ) : (
                  <Input value={policy.policyName} disabled />
                )}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={24}>
                <div style={{ marginBottom: 8, color: '#666' }}>政策内容</div>
                <Input.TextArea
                  placeholder="请输入政策内容"
                  value={policy.policyContent}
                  disabled={isViewMode}
                  rows={2}
                  maxLength={500}
                  showCount
                  onChange={(e) => handlePolicyChange(policy.id, 'policyContent', e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        ))
      )}

      {/* 保存政策按钮 */}
      {!isViewMode && policies.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button type="primary" loading={saving} onClick={onSave}>
            保存政策
          </Button>
        </div>
      )}
    </div>
  );
};

export default PoliciesTab;
